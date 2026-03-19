const Product = require("../models/ProductModel");
const Order = require("../models/OrderModel");
const User = require("../models/UserModel");
const InventoryVoucher = require("../models/InventoryVoucherModel");
const StockCard = require("../models/StockCardModel");
const InventoryThreshold = require("../models/InventoryThresholdModel");

const IMPORT_SOURCES = ["SUPPLIER", "RETURN", "ADJUSTMENT", "PRODUCTION", "OTHER"];
const EXPORT_REASONS = ["SALE", "ORDER_CANCEL", "RETURN_SUPPLIER", "DAMAGE", "LOSS", "ADJUSTMENT", "OTHER"];

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
        return "Danh sach san pham khong duoc de trong";
    }

    for (const item of items) {
        if (!item?.product) {
            return "Moi dong san pham phai co product";
        }
        if (item.quantity == null || Number(item.quantity) <= 0) {
            return "So luong phai lon hon 0";
        }
        if (item.unitPrice != null && Number(item.unitPrice) < 0) {
            return "Gia nhap/xuat khong duoc nho hon 0";
        }
    }

    return null;
};

const createImportVoucher = (payload, userId) => {
    return new Promise(async (resolve, reject) => {
        const { sourceType = "OTHER", supplierName, supplierContact, items, note, voucherDate, status = "confirmed" } = payload;

        try {
            const itemError = validateItems(items);
            if (itemError) {
                return resolve({ status: "ERR", message: itemError });
            }

            if (!IMPORT_SOURCES.includes(sourceType)) {
                return resolve({ status: "ERR", message: "Nguon nhap kho khong hop le" });
            }

            const userData = await User.findById(userId);
            if (!userData) {
                return resolve({ status: "ERR", message: "Nguoi thuc hien khong ton tai" });
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

                    if (!updatedProduct) {
                        for (const rollback of productUpdates) {
                            await Product.findByIdAndUpdate(rollback.productId, {
                                $inc: { countInStock: -rollback.quantity },
                            });
                        }
                        return resolve({
                            status: "ERR",
                            message: `San pham ${item.product} khong ton tai`,
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
                voucherDate: voucherDate || new Date(),
                status,
                items: normalizedItems,
                totalAmount,
                note,
                confirmedAt: status === "confirmed" ? new Date() : null,
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
                message: status === "confirmed" ? "Nhap kho thanh cong" : "Da tao phieu nhap o trang thai cho xu ly",
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
                return resolve({ status: "ERR", message: "Ly do xuat kho khong hop le" });
            }

            const userData = await User.findById(userId);
            if (!userData) {
                return resolve({ status: "ERR", message: "Nguoi thuc hien khong ton tai" });
            }

            if (linkedOrder) {
                const orderData = await Order.findById(linkedOrder);
                if (!orderData) {
                    return resolve({ status: "ERR", message: "Don hang lien ket khong ton tai" });
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
                        message: `San pham ${item.product} khong ton tai`,
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
                    message: "Ton kho khong du de xuat",
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
                    message: "Ton kho chua du. Da tao phieu xuat o trang thai cho xu ly",
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
                        message: "Ton kho khong du de xuat",
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
                message: "Xuat kho thanh cong",
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
                return resolve({ status: "ERR", message: "San pham khong ton tai" });
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
                message: "Lay the kho thanh cong",
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
                return resolve({ status: "ERR", message: "San pham khong ton tai" });
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
                message: "Cap nhat muc ton an toan thanh cong",
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
                        message: "Ton kho am bat thuong",
                    });
                } else if (currentStock === 0) {
                    alerts.push({
                        type: "OUT_OF_STOCK",
                        severity: "high",
                        product,
                        currentStock,
                        safeStockLevel,
                        message: "San pham da het hang",
                    });
                } else if (currentStock <= safeStockLevel) {
                    alerts.push({
                        type: "LOW_STOCK",
                        severity: "medium",
                        product,
                        currentStock,
                        safeStockLevel,
                        message: "San pham sap het hang",
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
                        message: "Hang ton kho lau ngay",
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
                            message: "Chenh lech ton kho giua he thong va thuc te",
                        });
                    }
                }
            }

            return resolve({
                status: "OK",
                message: "Lay danh sach canh bao ton kho thanh cong",
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
                .populate("items.product", "name countInStock")
                .populate("linkedOrder");

            return resolve({
                status: "OK",
                message: "Lay danh sach phieu kho thanh cong",
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
                .populate("items.product", "name countInStock")
                .populate("linkedOrder");

            if (!voucher) {
                return resolve({ status: "ERR", message: "Phieu kho khong ton tai" });
            }

            return resolve({
                status: "OK",
                message: "Lay chi tiet phieu kho thanh cong",
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
};
