const Product = require("../models/ProductModel");
const Order = require("../models/OrderModel");
const User = require("../models/UserModel");
const InventoryVoucher = require("../models/InventoryVoucherModel");
const StockCard = require("../models/StockCardModel");
const InventoryThreshold = require("../models/InventoryThresholdModel");

const IMPORT_SOURCES = ["SUPPLIER", "RETURN", "ADJUSTMENT", "PRODUCTION", "OTHER"];
const EXPORT_REASONS = ["SALE", "RETURN_SUPPLIER", "DAMAGE", "LOSS", "ADJUSTMENT", "OTHER"];

const buildVoucherCode = async (prefix) => {
    const now = new Date();
    const yyyymmdd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    for (let i = 0; i < 5; i += 1) {
        const random = Math.floor(1000 + Math.random() * 9000);
        const code = `${prefix}-${yyyymmdd}-${random}`;
        const exists = await InventoryVoucher.findOne({ voucherCode: code });
        if (!exists) {
            return code;
        }
    }

    return `${prefix}-${Date.now()}`;
};

const validateItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        return "Product items are required and must be a non-empty array";
    }

    for (const item of items) {
        if (!item?.product) {
            return "Each item must have a product";
        }
        if (item.quantity == null || Number(item.quantity) <= 0) {
            return "Quantity must be a positive number";
        }
        if (item.unitPrice != null && Number(item.unitPrice) < 0) {
            return "Unit price cannot be negative";
        }
    }

    return null;
};

const createImportVoucher = (payload, userId) => {
    return new Promise(async (resolve, reject) => {
        const { sourceType = "OTHER", supplierName, supplierContact, linkedOrder, items, note, voucherDate, status = "confirmed" } = payload;

        try {
            const itemError = validateItems(items);
            if (itemError) {
                return resolve({ status: "ERR", message: itemError });
            }

            if (!IMPORT_SOURCES.includes(sourceType)) {
                return resolve({ status: "ERR", message: "Invalid import source" });
            }

            if (linkedOrder) {
                const orderData = await Order.findById(linkedOrder);
                if (!orderData) {
                    return resolve({ status: "ERR", message: "Linked order not found" });
                }
            }

            const userData = await User.findById(userId);
            if (!userData) {
                return resolve({ status: "ERR", message: "User not found" });
            }

            const voucherCode = await buildVoucherCode("PNK");
            const productUpdates = [];
            const normalizedItems = [];
            let totalAmount = 0;

            if (status === "confirmed") {
                for (const item of items) {
                    const quantity = Number(item.quantity);
                    const unitPrice = Number(item.unitPrice || 0);

                    const updatedProduct = await Product.findByIdAndUpdate(
                        item.product,
                        {
                            $inc: { countInStock: quantity },
                            $set: { lastStockMovementAt: new Date() },
                        },
                        { new: true }
                    );

                    if (updatedProduct) {
                        const oldStock = updatedProduct.countInStock - quantity;
                        require("./ProductService").triggerRestockNotifications(updatedProduct, oldStock).catch(err => {
                            console.error("Restock notification error:", err);
                        });
                    }

                    if (!updatedProduct) {
                        for (const rollback of productUpdates) {
                            await Product.findByIdAndUpdate(rollback.productId, {
                                $inc: { countInStock: -rollback.quantity },
                            });
                        }
                        return resolve({
                            status: "ERR",
                            message: `Product ${item.product} not found`,
                        });
                    }

                    productUpdates.push({ productId: item.product, quantity });

                    const amount = quantity * unitPrice;
                    totalAmount += amount;

                    normalizedItems.push({
                        product: item.product,
                        quantity,
                        unitPrice,
                        amount,
                    });
                }
            } else {
                for (const item of items) {
                    const quantity = Number(item.quantity);
                    const unitPrice = Number(item.unitPrice || 0);
                    const amount = quantity * unitPrice;
                    totalAmount += amount;

                    normalizedItems.push({
                        product: item.product,
                        quantity,
                        unitPrice,
                        amount,
                    });
                }
            }

            const createdVoucher = await InventoryVoucher.create({
                voucherCode,
                transactionType: "IMPORT",
                sourceType,
                performedBy: userId,
                supplierName,
                supplierContact,
                linkedOrder,
                voucherDate: voucherDate || new Date(),
                status,
                items: normalizedItems,
                totalAmount,
                note,
                confirmedAt: status === "confirmed" ? new Date() : null,
                confirmedBy: status === "confirmed" ? userId : null,
            });

            if (status === "confirmed") {
                for (const item of normalizedItems) {
                    const productData = await Product.findById(item.product);
                    await StockCard.create({
                        product: item.product,
                        date: createdVoucher.voucherDate,
                        transactionType: sourceType === "ADJUSTMENT" ? "ADJUSTMENT" : "IMPORT",
                        voucherCode: createdVoucher.voucherCode,
                        voucherRef: createdVoucher._id,
                        description: `Nhap kho - ${sourceType}`,
                        quantityIn: item.quantity,
                        quantityOut: 0,
                        balanceAfter: productData?.countInStock || 0,
                        performedBy: userId,
                        note,
                    });
                }
            }

            return resolve({
                status: "OK",
                message: status === "confirmed" ? "Import voucher created successfully" : "Import voucher created but not confirmed",
                data: createdVoucher,
            });
        } catch (e) {
            return reject(e);
        }
    });
};

const createExportVoucher = (payload, userId) => {
    return new Promise(async (resolve, reject) => {
        const {
            exportReason = "OTHER",
            linkedOrder,
            items,
            note,
            voucherDate,
            insufficientAction = "error",
        } = payload;

        try {
            const itemError = validateItems(items);
            if (itemError) {
                return resolve({ status: "ERR", message: itemError });
            }

            if (!EXPORT_REASONS.includes(exportReason)) {
                return resolve({ status: "ERR", message: "Invalid export reason" });
            }

            const userData = await User.findById(userId);
            if (!userData) {
                return resolve({ status: "ERR", message: "User not found" });
            }

            if (linkedOrder) {
                const orderData = await Order.findById(linkedOrder);
                if (!orderData) {
                    return resolve({ status: "ERR", message: "Linked order not found" });
                }
            }

            const shortageItems = [];
            const normalizedItems = [];
            let totalAmount = 0;

            for (const item of items) {
                const productData = await Product.findById(item.product);
                if (!productData) {
                    return resolve({
                        status: "ERR",
                        message: `Product ${item.product} not found`,
                    });
                }

                const quantity = Number(item.quantity);
                const unitPrice = Number(item.unitPrice || productData.price || 0);
                const amount = quantity * unitPrice;

                totalAmount += amount;
                normalizedItems.push({
                    product: item.product,
                    quantity,
                    unitPrice,
                    amount,
                });

                if (productData.countInStock < quantity) {
                    shortageItems.push({
                        productId: productData._id,
                        productName: productData.name,
                        available: productData.countInStock,
                        requested: quantity,
                    });
                }
            }

            if (shortageItems.length > 0 && insufficientAction !== "pending") {
                return resolve({
                    status: "ERR",
                    message: "Insufficient stock for export",
                    data: shortageItems,
                });
            }

            const voucherCode = await buildVoucherCode("PXK");

            if (shortageItems.length > 0 && insufficientAction === "pending") {
                const pendingVoucher = await InventoryVoucher.create({
                    voucherCode,
                    transactionType: "EXPORT",
                    exportReason,
                    performedBy: userId,
                    linkedOrder,
                    voucherDate: voucherDate || new Date(),
                    status: "pending",
                    items: normalizedItems,
                    totalAmount,
                    note,
                });

                return resolve({
                    status: "OK",
                    message: "Insufficient stock. Export voucher created with pending status",
                    data: pendingVoucher,
                    shortageItems,
                });
            }

            const updatedProducts = [];
            for (const item of normalizedItems) {
                const updatedProduct = await Product.findOneAndUpdate(
                    {
                        _id: item.product,
                        countInStock: { $gte: item.quantity },
                    },
                    {
                        $inc: { countInStock: -item.quantity },
                        $set: { lastStockMovementAt: new Date() },
                    },
                    { new: true }
                );

                if (!updatedProduct) {
                    for (const rollback of updatedProducts) {
                        await Product.findByIdAndUpdate(rollback.productId, {
                            $inc: { countInStock: rollback.quantity },
                        });
                    }
                    return resolve({
                        status: "ERR",
                        message: "Insufficient stock for export",
                    });
                }

                updatedProducts.push({ productId: item.product, quantity: item.quantity });
            }

            const createdVoucher = await InventoryVoucher.create({
                voucherCode,
                transactionType: "EXPORT",
                exportReason,
                performedBy: userId,
                linkedOrder,
                voucherDate: voucherDate || new Date(),
                status: "confirmed",
                items: normalizedItems,
                totalAmount,
                note,
                confirmedAt: new Date(),
                confirmedBy: userId,
            });

            for (const item of normalizedItems) {
                const productData = await Product.findById(item.product);
                await StockCard.create({
                    product: item.product,
                    date: createdVoucher.voucherDate,
                    transactionType: exportReason === "ADJUSTMENT" ? "ADJUSTMENT" : "EXPORT",
                    voucherCode: createdVoucher.voucherCode,
                    voucherRef: createdVoucher._id,
                    description: `Xuat kho - ${exportReason}`,
                    quantityIn: 0,
                    quantityOut: item.quantity,
                    balanceAfter: productData?.countInStock || 0,
                    performedBy: userId,
                    note,
                });
            }

            return resolve({
                status: "OK",
                message: "Export voucher created successfully",
                data: createdVoucher,
            });
        } catch (e) {
            return reject(e);
        }
    });
};

const getStockCardByProduct = (productId, fromDate, toDate) => {
    return new Promise(async (resolve, reject) => {
        try {
            const productData = await Product.findById(productId);
            if (!productData) {
                return resolve({ status: "ERR", message: "Product not found" });
            }

            const query = { product: productId };
            if (fromDate || toDate) {
                query.date = {};
                if (fromDate) query.date.$gte = new Date(fromDate);
                if (toDate) query.date.$lte = new Date(toDate);
            }

            const records = await StockCard.find(query)
                .sort({ date: 1, createdAt: 1 })
                .populate("performedBy", "name email")
                .populate("voucherRef");

            return resolve({
                status: "OK",
                message: "Stock card retrieved successfully",
                data: {
                    product: {
                        _id: productData._id,
                        name: productData.name,
                        countInStock: productData.countInStock,
                    },
                    records,
                },
            });
        } catch (e) {
            return reject(e);
        }
    });
};

const upsertThreshold = (productId, payload) => {
    return new Promise(async (resolve, reject) => {
        const { safeStockLevel, maxStorageDays, note } = payload;

        try {
            const productData = await Product.findById(productId);
            if (!productData) {
                return resolve({ status: "ERR", message: "Product not found" });
            }

            const updatedThreshold = await InventoryThreshold.findOneAndUpdate(
                { product: productId },
                {
                    safeStockLevel: Number(safeStockLevel ?? 0),
                    maxStorageDays: Number(maxStorageDays ?? 90),
                    note,
                },
                { new: true, upsert: true }
            );

            return resolve({
                status: "OK",
                message: "Threshold updated successfully",
                data: updatedThreshold,
            });
        } catch (e) {
            return reject(e);
        }
    });
};

const getInventoryAlerts = (actualCounts = []) => {
    return new Promise(async (resolve, reject) => {
        try {
            const products = await Product.find().select("name countInStock lastStockMovementAt updatedAt");
            const thresholds = await InventoryThreshold.find();
            const thresholdMap = new Map(thresholds.map((item) => [item.product.toString(), item]));
            const alerts = [];
            const now = new Date();

            for (const product of products) {
                const threshold = thresholdMap.get(product._id.toString());
                const safeStockLevel = Number(threshold?.safeStockLevel ?? 0);
                const maxStorageDays = Number(threshold?.maxStorageDays ?? 90);
                const currentStock = Number(product.countInStock ?? 0);

                if (currentStock < 0) {
                    alerts.push({
                        type: "NEGATIVE_STOCK",
                        severity: "high",
                        product,
                        currentStock,
                        safeStockLevel,
                        message: "Insufficient stock - stock level is negative",
                    });
                } else if (currentStock === 0) {
                    alerts.push({
                        type: "OUT_OF_STOCK",
                        severity: "high",
                        product,
                        currentStock,
                        safeStockLevel,
                        message: "Product is out of stock",
                    });
                } else if (currentStock <= safeStockLevel) {
                    alerts.push({
                        type: "LOW_STOCK",
                        severity: "medium",
                        product,
                        currentStock,
                        safeStockLevel,
                        message: "Product is running low on stock",
                    });
                }

                const lastMovementAt = product.lastStockMovementAt || product.updatedAt;
                const daysWithoutMovement = Math.floor((now.getTime() - new Date(lastMovementAt).getTime()) / (1000 * 60 * 60 * 24));

                if (currentStock > 0 && daysWithoutMovement >= maxStorageDays) {
                    alerts.push({
                        type: "SLOW_MOVING",
                        severity: "medium",
                        product,
                        currentStock,
                        safeStockLevel,
                        daysWithoutMovement,
                        maxStorageDays,
                        message: "Product has been in stock for a long time without movement",
                    });
                }
            }

            if (Array.isArray(actualCounts) && actualCounts.length > 0) {
                for (const actual of actualCounts) {
                    if (!actual?.product) {
                        continue;
                    }

                    const productData = products.find((item) => item._id.toString() === actual.product.toString());
                    if (!productData) {
                        continue;
                    }

                    const systemQty = Number(productData.countInStock ?? 0);
                    const actualQty = Number(actual.actualCount ?? 0);
                    const difference = actualQty - systemQty;

                    if (difference !== 0) {
                        alerts.push({
                            type: "STOCK_DISCREPANCY",
                            severity: "high",
                            product: productData,
                            systemQty,
                            actualQty,
                            difference,
                            message: "Stock discrepancy between system and actual count",
                        });
                    }
                }
            }

            return resolve({
                status: "OK",
                message: "Inventory alerts retrieved successfully",
                data: alerts,
            });
        } catch (e) {
            return reject(e);
        }
    });
};

const getAllVouchers = (filters = {}) => {
    return new Promise(async (resolve, reject) => {
        const { transactionType, status, fromDate, toDate } = filters;

        try {
            const query = {};
            if (transactionType) query.transactionType = transactionType;
            if (status) query.status = status;
            if (fromDate || toDate) {
                query.voucherDate = {};
                if (fromDate) query.voucherDate.$gte = new Date(fromDate);
                if (toDate) query.voucherDate.$lte = new Date(toDate);
            }

            const vouchers = await InventoryVoucher.find(query)
                .sort({ voucherDate: -1, createdAt: -1 })
                .populate("performedBy", "name email")
                .populate("confirmedBy", "name email")
                .populate("cancelledBy", "name email")
                .populate("items.product", "name countInStock");

            return resolve({
                status: "OK",
                message: "Inventory vouchers retrieved successfully",
                data: vouchers,
            });
        } catch (e) {
            return reject(e);
        }
    });
};

const getVoucherDetails = (voucherId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const voucher = await InventoryVoucher.findById(voucherId)
                .populate("performedBy", "name email")
                .populate("confirmedBy", "name email")
                .populate("cancelledBy", "name email")
                .populate("items.product", "name countInStock");

            if (!voucher) {
                return resolve({ status: "ERR", message: "Voucher not found" });
            }

            return resolve({
                status: "OK",
                message: "Voucher details retrieved successfully",
                data: voucher,
            });
        } catch (e) {
            return reject(e);
        }
    });
};

const confirmVoucher = (voucherId, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const voucher = await InventoryVoucher.findById(voucherId);

            if (!voucher) {
                return resolve({ status: "ERR", message: "Voucher not found" });
            }

            if (!["pending", "draft"].includes(voucher.status)) {
                return resolve({
                    status: "ERR",
                    message: "Only pending or draft vouchers can be confirmed",
                });
            }

            if (!Array.isArray(voucher.items) || voucher.items.length === 0) {
                return resolve({
                    status: "ERR",
                    message: "Voucher has no item to confirm",
                });
            }

            if (voucher.transactionType === "IMPORT") {
                const updatedProducts = [];

                for (const item of voucher.items) {
                    const quantity = Number(item.quantity || 0);
                    if (quantity <= 0) {
                        return resolve({ status: "ERR", message: "Invalid item quantity" });
                    }

                    const updatedProduct = await Product.findByIdAndUpdate(
                        item.product,
                        {
                            $inc: { countInStock: quantity },
                            $set: { lastStockMovementAt: new Date() },
                        },
                        { new: true }
                    );

                    if (updatedProduct) {
                        const oldStock = updatedProduct.countInStock - quantity;
                        require("./ProductService").triggerRestockNotifications(updatedProduct, oldStock).catch(err => {
                            console.error("Restock notification error:", err);
                        });
                    }

                    if (!updatedProduct) {
                        for (const rollback of updatedProducts) {
                            await Product.findByIdAndUpdate(rollback.productId, {
                                $inc: { countInStock: -rollback.quantity },
                            });
                        }
                        return resolve({
                            status: "ERR",
                            message: `Product ${item.product} not found`,
                        });
                    }

                    updatedProducts.push({
                        productId: item.product,
                        quantity,
                    });
                }

                for (const item of voucher.items) {
                    const productData = await Product.findById(item.product);
                    await StockCard.create({
                        product: item.product,
                        date: voucher.voucherDate,
                        transactionType: voucher.sourceType === "ADJUSTMENT" ? "ADJUSTMENT" : "IMPORT",
                        voucherCode: voucher.voucherCode,
                        voucherRef: voucher._id,
                        description: `Nhap kho - ${voucher.sourceType || "OTHER"}`,
                        quantityIn: Number(item.quantity || 0),
                        quantityOut: 0,
                        balanceAfter: productData?.countInStock || 0,
                        performedBy: userId,
                        note: voucher.note,
                    });
                }
            }

            if (voucher.transactionType === "EXPORT") {
                const updatedProducts = [];

                for (const item of voucher.items) {
                    const quantity = Number(item.quantity || 0);
                    if (quantity <= 0) {
                        return resolve({ status: "ERR", message: "Invalid item quantity" });
                    }

                    const updatedProduct = await Product.findOneAndUpdate(
                        {
                            _id: item.product,
                            countInStock: { $gte: quantity },
                        },
                        {
                            $inc: { countInStock: -quantity },
                            $set: { lastStockMovementAt: new Date() },
                        },
                        { new: true }
                    );

                    if (!updatedProduct) {
                        for (const rollback of updatedProducts) {
                            await Product.findByIdAndUpdate(rollback.productId, {
                                $inc: { countInStock: rollback.quantity },
                            });
                        }
                        return resolve({
                            status: "ERR",
                            message: "Insufficient stock for confirming export voucher",
                        });
                    }

                    updatedProducts.push({
                        productId: item.product,
                        quantity,
                    });
                }

                for (const item of voucher.items) {
                    const productData = await Product.findById(item.product);
                    await StockCard.create({
                        product: item.product,
                        date: voucher.voucherDate,
                        transactionType: voucher.exportReason === "ADJUSTMENT" ? "ADJUSTMENT" : "EXPORT",
                        voucherCode: voucher.voucherCode,
                        voucherRef: voucher._id,
                        description: `Xuat kho - ${voucher.exportReason || "OTHER"}`,
                        quantityIn: 0,
                        quantityOut: Number(item.quantity || 0),
                        balanceAfter: productData?.countInStock || 0,
                        performedBy: userId,
                        note: voucher.note,
                    });
                }
            }

            voucher.status = "confirmed";
            voucher.confirmedAt = new Date();
            voucher.confirmedBy = userId;
            voucher.cancelledAt = null;
            voucher.cancelledBy = null;
            await voucher.save();

            return resolve({
                status: "OK",
                message: "Voucher confirmed successfully",
                data: voucher,
            });
        } catch (e) {
            return reject(e);
        }
    });
};

const cancelVoucher = (voucherId, payload = {}, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const voucher = await InventoryVoucher.findById(voucherId);
            if (!voucher) {
                return resolve({ status: "ERR", message: "Voucher not found" });
            }

            if (!["pending", "draft"].includes(voucher.status)) {
                return resolve({
                    status: "ERR",
                    message: "Only pending or draft vouchers can be cancelled",
                });
            }

            const reason = payload?.reason ? String(payload.reason).trim() : "";

            voucher.status = "cancelled";
            voucher.cancelledAt = new Date();
            voucher.cancelledBy = userId;
            voucher.note = reason
                ? `${voucher.note ? `${voucher.note}\n` : ""}[Cancel reason] ${reason}`
                : voucher.note;
            await voucher.save();

            return resolve({
                status: "OK",
                message: "Voucher cancelled successfully",
                data: voucher,
            });
        } catch (e) {
            return reject(e);
        }
    });
};

const updateVoucherNote = (voucherId, note) => {
    return new Promise(async (resolve, reject) => {
        try {
            const voucher = await InventoryVoucher.findById(voucherId);
            if (!voucher) {
                return resolve({ status: "ERR", message: "Voucher not found" });
            }

            if (!["pending", "draft"].includes(voucher.status)) {
                return resolve({
                    status: "ERR",
                    message: "Only pending or draft vouchers can be updated",
                });
            }

            voucher.note = note != null ? String(note) : "";
            await voucher.save();

            return resolve({
                status: "OK",
                message: "Voucher note updated successfully",
                data: voucher,
            });
        } catch (e) {
            return reject(e);
        }
    });
};

module.exports = {
    createImportVoucher,
    createExportVoucher,
    getStockCardByProduct,
    upsertThreshold,
    getInventoryAlerts,
    getAllVouchers,
    getVoucherDetails,
    confirmVoucher,
    cancelVoucher,
    updateVoucherNote,
};
