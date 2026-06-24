const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const EmailService = require('./EmailService')
const PayOSService = require('./PayOSService');
const User = require("../models/UserModel");
const InventoryVoucher = require("../models/InventoryVoucherModel");
const StockCard = require("../models/StockCardModel");
const InventoryThreshold = require("../models/InventoryThresholdModel");
const NotificationService = require('./NotificationService');
const { emitToAdmin, emitToUser } = require('../socket/notificationSocket');


const createOrder = (newOrder) => {
    return new Promise(async (resolve, reject) => {
        const { orderItems, paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, phone, user, isPaid, paidAt, isDelivered, email } = newOrder;
        const deliveryStatus = ["pending", "processing", "shipping", "delivered"].includes(isDelivered)
            ? isDelivered
            : "pending";

        let session = null;

        try {
            // Check user existence and get email outside the transaction to minimize database locking
            let userEmail = email;
            if (user) {
                const userData = await User.findById(user).select('email').lean();
                if (!userData) {
                    return resolve({
                        status: 'ERR',
                        message: `User not found!`
                    });
                }
                userEmail = email || userData.email;
            }

            // Lấy session từ MongoDB để dùng transaction - đảm bảo atomicity
            session = await require('mongoose').startSession();
            session.startTransaction();

            const updatedProducts = []; //Lưu lại các sản phẩm đã cập nhật
            const normalizedOrderItems = [];
            const failedItems = [];

            // Duyệt từng sản phẩm để cập nhật kho
            for (const order of orderItems) {
                const productData = await Product.findOneAndUpdate(
                    {
                        _id: order.product,
                        countInStock: { $gte: Number(order.amount || 0) }
                    },
                    {
                        $inc: {
                            countInStock: -Number(order.amount || 0),
                            sold: +Number(order.amount || 0),
                        },
                        $set: {
                            lastStockMovementAt: new Date(),
                        },
                    },
                    { new: true, session }
                );

                if (!productData) {
                    failedItems.push(order.product);
                    break; // ngưng cập nhật tiếp nếu có lỗi
                }

                // Lưu lại sản phẩm đã cập nhật thành công để rollback nếu cần
                updatedProducts.push({ productId: order.product, amount: Number(order.amount || 0) });

                const primaryImage = Array.isArray(order.images) && order.images.length > 0
                    ? order.images[0]
                    : (order.image || (Array.isArray(productData?.images) && productData.images.length > 0 ? productData.images[0] : ""));

                normalizedOrderItems.push({
                    ...order,
                    product: order.product,
                    name: order.name || productData?.name || "",
                    amount: Number(order.amount || 0),
                    price: Number(order.price ?? productData?.price ?? 0),
                    discount: Number(order.discount || 0),
                    countInStock: Number(productData?.countInStock || 0),
                    image: primaryImage,
                    orderSource: ["organic", "chatbot", "rag_recommendation"].includes(order.orderSource)
                        ? order.orderSource
                        : "organic",
                });
            }

            // Nếu có lỗi → rollback toàn bộ transaction
            if (failedItems.length > 0) {
                await session.abortTransaction();
                session.endSession();
                return resolve({
                    status: 'ERR',
                    message: `Số lượng tồn kho của sản phẩm ${failedItems.join(', ')} không đủ!`
                });
            }

            // Tạo đơn hàng duy nhất sau khi kiểm tra và cập nhật kho thành công
            const createdOrder = await Order.create([{
                orderItems: normalizedOrderItems,
                shippingAddress: {
                    fullName,
                    address,
                    city,
                    phone
                },
                paymentMethod,
                itemsPrice,
                shippingPrice,
                totalPrice,
                user,
                isPaid,
                paidAt,
                isDelivered: deliveryStatus,
            }], { session });

            // Lấy đơn hàng từ array result của create
            const createdOrderDoc = Array.isArray(createdOrder) ? createdOrder[0] : createdOrder;

            const voucherCode = `PXK-ORDER-${createdOrderDoc._id.toString().slice(-6).toUpperCase()}`;
            const voucherItems = normalizedOrderItems.map((item) => ({
                product: item.product,
                quantity: Number(item.amount || 0),
                unitPrice: Number(item.price || 0),
                amount: Number(item.amount || 0) * Number(item.price || 0),
            }));

            const saleVoucher = await InventoryVoucher.create([{
                voucherCode,
                transactionType: "EXPORT",
                exportReason: "SALE",
                performedBy: newOrder.adminId || user,
                linkedOrder: createdOrderDoc._id,
                voucherDate: new Date(),
                status: "confirmed",
                items: voucherItems,
                totalAmount: voucherItems.reduce((sum, item) => sum + item.amount, 0),
                note: `Xuat kho tu don hang ${createdOrderDoc._id}`,
                confirmedAt: new Date(),
                confirmedBy: newOrder.adminId || user,
            }], { session });

            const saleVoucherDoc = Array.isArray(saleVoucher) ? saleVoucher[0] : saleVoucher;

            const stockCardsToCreate = normalizedOrderItems.map((item) => ({
                product: item.product,
                date: new Date(),
                transactionType: "EXPORT",
                voucherCode,
                voucherRef: saleVoucherDoc._id,
                description: "Xuat kho - SALE",
                quantityIn: 0,
                quantityOut: Number(item.amount || 0),
                balanceAfter: Number(item.countInStock || 0),
                performedBy: newOrder.adminId || user,
                note: `Lien ket don hang ${createdOrderDoc._id}`,
            }));

            await StockCard.insertMany(stockCardsToCreate, { session });

            // Commit transaction nếu tất cả thành công
            await session.commitTransaction();
            session.endSession();
            session = null;

            // Gửi email bất đồng bộ ngoài transaction bằng setImmediate để phản hồi HTTP ngay lập tức
            setImmediate(() => {
                if (userEmail) {
                    EmailService.sendEmailOrder({ 
                        email: userEmail, 
                        orderItems: normalizedOrderItems, 
                        totalPrice 
                    }).catch((err) => {
                        console.error("Failed to send order confirmation email:", err);
                    });
                }

                // Thông báo đơn hàng mới cho Admin
                _triggerNewOrderNotification(createdOrderDoc).catch((err) => {
                    console.error("[Notification] NEW_ORDER trigger failed:", err);
                });

                // Kiểm tra và cảnh báo tồn kho thấp
                _triggerLowStockNotifications(normalizedOrderItems).catch((err) => {
                    console.error("[Notification] LOW_STOCK trigger failed:", err);
                });
            });

            // Loại bỏ trường image (chứa base64) ra khỏi data trả về để giảm dung lượng payload xuống < 1KB
            const orderResponse = createdOrderDoc.toObject();
            if (orderResponse && Array.isArray(orderResponse.orderItems)) {
                orderResponse.orderItems.forEach(item => {
                    delete item.image;
                });
            }

            return resolve({
                status: 'OK',
                message: 'Order placed successfully!',
                data: orderResponse
            });

        } catch (e) {
            // Rollback transaction tự động nếu lỗi
            try {
                if (session) {
                    await session.abortTransaction();
                }
            } catch (abortError) {
                console.error('Error aborting transaction:', abortError);
            } finally {
                if (session) {
                    session.endSession();
                }
            }

            return reject(e);
        }
    });
};


// Lấy toàn bộ đơn hàng của người dùng
// Mặc định loại bỏ orderItems.image để giảm payload network.
const getUserOrders = (userId, options = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const includeImage = options.includeImage === true;
            const page = Number(options.page);
            const limit = Number(options.limit);
            const hasPagination = Number.isInteger(page) && page > 0 && Number.isInteger(limit) && limit > 0;

            const queryObj = { user: userId };
            if (options.startDate && options.endDate) {
                queryObj.createdAt = {
                    $gte: new Date(options.startDate),
                    $lte: new Date(options.endDate)
                };
            }

            const query = Order.find(queryObj).sort({ createdAt: -1 });

            if (!includeImage) {
                query.select("-orderItems.image");
            }

            if (hasPagination) {
                const skip = (page - 1) * limit;
                query.skip(skip).limit(limit);
            }

            const orders = await query.lean();


            if (!orders || orders.length === 0) {
                return resolve({
                    status: 'OK',
                    message: 'No orders found',
                    data: [],
                    pagination: hasPagination
                        ? {
                            page,
                            limit,
                            totalItems: 0,
                            totalPages: 0,
                        }
                        : undefined,
                });
            }

            if (hasPagination) {
                const totalItems = await Order.countDocuments({ user: userId });
                const totalPages = Math.ceil(totalItems / limit);
                return resolve({
                    status: 'OK',
                    message: 'Get user orders successfully!',
                    data: orders,
                    pagination: {
                        page,
                        limit,
                        totalItems,
                        totalPages,
                    }
                });
            }

            return resolve({
                status: 'OK',
                message: 'Get user orders successfully!',
                data: orders
            });
        } catch (error) {
            return reject(error);
        }
    });
};

// Lấy chi tiết đơn hàng theo ID
const getOrderById = (orderId, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // const order = await Order.findById(orderId).populate('orderItems.product').populate('user', 'name email phone address');
            const order = await Order.findById(orderId)

            if (!order) {
                return resolve({
                    status: 'ERR',
                    message: 'Order not found!'
                });
            }

            const userData = await User.findById(userId);
            if (!userData) {
                return resolve({
                    status: 'ERR',
                    message: 'User not found!'
                });
            }

            // Chỉ chủ sở hữu đơn hàng hoặc admin mới có quyền xem chi tiết.
            const isOwner = order.user?.toString() === userId?.toString();
            const isAdmin = Boolean(userData.isAdmin);

            if (!isOwner && !isAdmin) {
                return resolve({
                    status: 'ERR',
                    message: 'Unauthorized: You can only view your own orders!'
                });
            }

            return resolve({
                status: 'OK',
                message: 'Get order details successfully!',
                data: order
            });
        } catch (error) {
            return reject(error);
        }
    });
};

// Xóa đơn hàng
const deleteOrder = (orderId, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.findById(orderId);
            const userData = await User.findById(userId);

            if (!order) {
                return resolve({
                    status: 'ERR',
                    message: 'Order not found!'
                });
            }

            // Kiểm tra xem người dùng có phải là chủ sở hữu đơn hàng hay không
            if (!userData.isAdmin && order.user.toString() !== userId.toString()) {
                return resolve({
                    status: 'ERR',
                    message: 'Unauthorized: You can only delete your own orders!'
                });
            }

            // Hoàn lại hàng tồn kho nếu đơn hàng chưa được giao
            if (order.isDelivered === 'pending' || order.isDelivered === 'processing') {
                const orderOwner = await User.findById(order.user);
                const ownerFullName = order?.shippingAddress?.fullName || orderOwner?.name || 'Khach hang';
                const ownerPhone = order?.shippingAddress?.phone || orderOwner?.phone || '--';
                const ownerEmail = orderOwner?.email || '--';
                const ownerContactInfo = `${ownerFullName} - ${ownerPhone} - ${ownerEmail}`;
                const voucherItems = [];

                for (const item of order.orderItems) {
                    const quantity = Number(item.amount || 0);
                    const unitPrice = Number(item.price || 0);
                    const amount = quantity * unitPrice;

                    const updatedProduct = await Product.findByIdAndUpdate(item.product, {
                        $inc: {
                            countInStock: +quantity,
                            sold: -quantity,
                        },
                        $set: {
                            lastStockMovementAt: new Date(),
                        },
                    }, { new: true });

                    if (updatedProduct) {
                        const oldStock = updatedProduct.countInStock - quantity;
                        require("./ProductService").triggerRestockNotifications(updatedProduct, oldStock).catch(err => {
                            console.error("Restock notification error:", err);
                        });
                    }

                    voucherItems.push({
                        product: item.product,
                        quantity,
                        unitPrice,
                        amount,
                    });
                }

                const voucherCode = `PNK-ORDER-CANCEL-${order._id.toString().slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

                const importVoucher = await InventoryVoucher.create({
                    voucherCode,
                    transactionType: 'IMPORT',
                    sourceType: 'RETURN',
                    performedBy: userId,
                    linkedOrder: order._id,
                    supplierName: ownerFullName,
                    supplierContact: ownerContactInfo,
                    voucherDate: new Date(),
                    status: 'confirmed',
                    items: voucherItems,
                    totalAmount: voucherItems.reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
                    note: `Nhap kho do huy don hang ${order._id}. Lien he: ${ownerContactInfo}`,
                    confirmedAt: new Date(),
                    confirmedBy: userId,
                });

                for (const item of voucherItems) {
                    const productData = await Product.findById(item.product);

                    await StockCard.create({
                        product: item.product,
                        date: new Date(),
                        transactionType: 'IMPORT',
                        voucherCode,
                        voucherRef: importVoucher._id,
                        description: 'Nhap kho - RETURN',
                        quantityIn: item.quantity,
                        quantityOut: 0,
                        balanceAfter: productData?.countInStock || 0,
                        performedBy: userId,
                        note: `Hoan kho tu don hang ${order._id}`,
                    });
                }
            }

            // Xóa đơn hàng
            await Order.findByIdAndDelete(orderId);

            return resolve({
                status: 'OK',
                message: 'Order deleted successfully!'
            });
        } catch (error) {
            return reject(error);
        }
    });
};

// Lấy toàn bộ danh sách đơn hàng (Admin)
// Mặc định loại bỏ orderItems.image để giảm payload network.
const getAllOrders = (options = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const includeImage = options.includeImage === true;
            const queryObj = {};
            if (options.startDate && options.endDate) {
                queryObj.createdAt = {
                    $gte: new Date(options.startDate),
                    $lte: new Date(options.endDate)
                };
            }
            const query = Order.find(queryObj).sort({ createdAt: -1 });

            if (!includeImage) {
                query.select("-orderItems.image");
            }

            const orders = await query
            // .populate('orderItems.product')
            // .populate('user', 'name email phone address city');

            if (!orders || orders.length === 0) {
                return resolve({
                    status: 'OK',
                    message: 'No orders found!',
                    data: []
                });
            }

            return resolve({
                status: 'OK',
                message: 'Get all orders successfully!',
                data: orders
            });
        } catch (error) {
            return reject(error);
        }
    });
};

const updateOrder = (orderId, updateData, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Chỉ người dùng admin mới được quyền cập nhật trạng thái đơn hàng hoặc là người dùng chủ sở hữu đơn hàng
            const userData = await User.findById(userId);
            if (!userData) {
                return resolve({
                    status: 'ERR',
                    message: 'User not found!'
                });
            }

            const oldOrder = await Order.findById(orderId);
            if (!oldOrder) {
                return resolve({
                    status: 'ERR',
                    message: 'Order not found!'
                });
            }

            const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

            if (!userData.isAdmin && order.user.toString() !== userId.toString()) {
                return resolve({
                    status: 'ERR',
                    message: 'Unauthorized: You can only update your own orders!'
                });
            }

            // Nếu admin cập nhật trạng thái giao hàng và trạng thái có thay đổi → thông báo cho user
            if (userData.isAdmin && updateData.isDelivered && updateData.isDelivered !== oldOrder.isDelivered) {
                setImmediate(() => {
                    _triggerOrderStatusNotification(order, updateData.isDelivered).catch((err) => {
                        console.error("[Notification] ORDER_STATUS trigger failed:", err);
                    });
                });
            }

            return resolve({
                status: 'OK',
                message: 'Order updated successfully!',
                data: order
            });
        } catch (error) {
            return reject(error);
        }
    });
}


module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    deleteOrder,
    getAllOrders,
    updateOrder,
    createPendingOrder,
    cancelExpiredOrder,
    createManualOrderService
};
// =============================================
// Tạo đơn tại quầy cho Admin
// =============================================
async function createManualOrderService(newOrder) {
    try {
        const { paymentMethod, customerType, ...rest } = newOrder;

        const address = newOrder.address?.trim() || "Tại cửa hàng";
        const city = newOrder.city?.trim() || "Tại cửa hàng";
        const fullName = newOrder.fullName?.trim() || "Khách vãng lai";
        const phone = newOrder.phone?.trim() || "0000000000";
        const user = customerType === 'guest' ? null : newOrder.user;

        const orderData = {
            ...rest,
            address,
            city,
            fullName,
            phone,
            user,
            paymentMethod: paymentMethod || 'cash',
            shippingPrice: 0,
            isDelivered: 'delivered',
            adminId: newOrder.adminId, // for inventory performedBy
        };

        if (paymentMethod === 'cash') {
            orderData.isPaid = true;
            orderData.paidAt = new Date();
            const result = await createOrder(orderData);
            return result;
        } else if (paymentMethod === 'payos') {
            const pendingOrderResult = await createPendingOrder(orderData);
            
            if (pendingOrderResult.status === "ERR") {
                return pendingOrderResult;
            }

            const order = pendingOrderResult.data;
            const payosOrderCode = PayOSService.generateOrderCode(order._id);
            
            const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:3000";

            const paymentLinkData = await PayOSService.createPaymentLink({
                orderCode: payosOrderCode,
                amount: Math.round(order.totalPrice),
                description: `FitnFood #${String(order._id).slice(-6).toUpperCase()}`,
                items: orderData.orderItems.map((item) => ({
                    name: String(item.name || "Sản phẩm").slice(0, 50),
                    quantity: Number(item.amount || 1),
                    price: Math.round(Number(item.price || 0)),
                })),
                returnUrl: `${frontendUrl}/orderSuccess`,
                cancelUrl: `${frontendUrl}/payment`,
                buyerName: fullName,
                buyerPhone: phone,
            });

            await Order.findByIdAndUpdate(order._id, {
                payosOrderCode,
                paymentLinkId: paymentLinkData.paymentLinkId,
            });

            return {
                status: "OK",
                message: "Pending order and PayOS link created!",
                data: {
                    orderId: order._id,
                    payosOrderCode,
                    qrCode: paymentLinkData.qrCode,
                    checkoutUrl: paymentLinkData.checkoutUrl,
                    paymentLinkId: paymentLinkData.paymentLinkId,
                    totalPrice: order.totalPrice,
                },
            };
        } else {
            return {
                status: "ERR",
                message: "Unsupported payment method!",
            };
        }
    } catch (e) {
        throw e;
    }
};

// =============================================
// Notification helper functions (private)
// =============================================

/**
 * Trigger NEW_ORDER notification đến Admin
 */
async function _triggerNewOrderNotification(order) {
    try {
        const notification = await NotificationService.createNotification({
            recipientType: 'admin',
            type: 'NEW_ORDER',
            title: 'Đơn hàng mới!',
            message: `Đơn hàng #${String(order._id).slice(-6).toUpperCase()} vừa được đặt.`,
            metadata: {
                orderId: String(order._id),
                totalPrice: order.totalPrice,
                paymentMethod: order.paymentMethod,
            },
        });
        emitToAdmin(notification);
    } catch (err) {
        console.error('[Notification] _triggerNewOrderNotification error:', err);
    }
}

/**
 * Kiểm tra từng sản phẩm trong đơn hàng sau khi tạo:
 * Nếu countInStock < safeStockLevel và chưa có LOW_STOCK unread → emit 1 lần
 */
async function _triggerLowStockNotifications(orderItems) {
    try {
        for (const item of orderItems) {
            const productId = item.product;

            // Lấy countInStock mới nhất từ DB (sau khi đã trừ)
            const product = await Product.findById(productId).select('name countInStock').lean();
            if (!product) continue;

            const threshold = await InventoryThreshold.findOne({ product: productId }).lean();
            if (!threshold || threshold.safeStockLevel <= 0) continue;

            if (product.countInStock < threshold.safeStockLevel) {
                // Anti-spam: chỉ tạo nếu chưa có LOW_STOCK unread cho sản phẩm này
                const alreadyNotified = await NotificationService.hasUnreadLowStockNotification(productId);
                if (alreadyNotified) continue;

                const notification = await NotificationService.createNotification({
                    recipientType: 'admin',
                    type: 'LOW_STOCK',
                    title: 'Cảnh báo tồn kho thấp!',
                    message: `"${product.name}" còn ${product.countInStock} sản phẩm (ngưỡng an toàn: ${threshold.safeStockLevel}).`,
                    metadata: {
                        productId: String(productId),
                        productName: product.name,
                        currentStock: product.countInStock,
                        safeStockLevel: threshold.safeStockLevel,
                    },
                });
                emitToAdmin(notification);
            }
        }
    } catch (err) {
        console.error('[Notification] _triggerLowStockNotifications error:', err);
    }
}

/**
 * Trigger ORDER_STATUS notification đến User khi admin cập nhật trạng thái đơn
 */
async function _triggerOrderStatusNotification(order, newStatus) {
    try {
        const statusLabels = {
            pending:    'Chờ xác nhận',
            processing: 'Đang đóng gói',
            shipping:   'Đang giao hàng',
            delivered:  'Đã giao thành công',
        };
        const statusLabel = statusLabels[newStatus] || newStatus;
        const userId = String(order.user);

        const notification = await NotificationService.createNotification({
            recipient: userId,
            recipientType: 'user',
            type: 'ORDER_STATUS',
            title: 'Cập nhật đơn hàng',
            message: `Đơn hàng #${String(order._id).slice(-6).toUpperCase()} đã chuyển sang: ${statusLabel}.`,
            metadata: {
                orderId: String(order._id),
                newStatus,
                statusLabel,
            },
        });
        emitToUser(userId, notification);
    } catch (err) {
        console.error('[Notification] _triggerOrderStatusNotification error:', err);
    }
}

// =============================================
// PayOS: Tạo đơn hàng chờ thanh toán (isPaid=false)
// =============================================

/**
 * Tạo đơn hàng với trạng thái chờ thanh toán PayOS.
 * Trừ kho ngay, nhưng isPaid=false. Nếu hết hạn sẽ gọi cancelExpiredOrder.
 */
async function createPendingOrder(newOrder) {
    const {
        orderItems, paymentMethod, itemsPrice, shippingPrice, totalPrice,
        fullName, address, city, phone, user, email,
        payosOrderCode, paymentLinkId,
    } = newOrder;

    const deliveryStatus = newOrder.isDelivered || "pending";
    let session = null;

    try {
        let userEmail = email;
        if (user) {
            const userData = await User.findById(user).select('email').lean();
            if (!userData) {
                return { status: 'ERR', message: 'User not found!' };
            }
            userEmail = email || userData.email;
        }

        session = await require('mongoose').startSession();
        session.startTransaction();

        const updatedProducts = [];
        const normalizedOrderItems = [];
        const failedItems = [];

        for (const order of orderItems) {
            const productData = await Product.findOneAndUpdate(
                { _id: order.product, countInStock: { $gte: Number(order.amount || 0) } },
                {
                    $inc: { countInStock: -Number(order.amount || 0), sold: +Number(order.amount || 0) },
                    $set: { lastStockMovementAt: new Date() },
                },
                { new: true, session }
            );

            if (!productData) {
                failedItems.push(order.product);
                break;
            }

            updatedProducts.push({ productId: order.product, amount: Number(order.amount || 0) });

            const primaryImage = Array.isArray(order.images) && order.images.length > 0
                ? order.images[0]
                : (order.image || (Array.isArray(productData?.images) && productData.images.length > 0 ? productData.images[0] : ""));

            normalizedOrderItems.push({
                ...order,
                product: order.product,
                name: order.name || productData?.name || "",
                amount: Number(order.amount || 0),
                price: Number(order.price ?? productData?.price ?? 0),
                discount: Number(order.discount || 0),
                countInStock: Number(productData?.countInStock || 0),
                image: primaryImage,
                orderSource: ["organic", "chatbot", "rag_recommendation"].includes(order.orderSource)
                    ? order.orderSource
                    : "organic",
            });
        }

        if (failedItems.length > 0) {
            await session.abortTransaction();
            session.endSession();
            return { status: 'ERR', message: `Số lượng tồn kho không đủ!` };
        }

        const createdOrder = await Order.create([{
            orderItems: normalizedOrderItems,
            shippingAddress: { fullName, address, city, phone },
            paymentMethod: paymentMethod || 'payos',
            itemsPrice,
            shippingPrice,
            totalPrice,
            user,
            isPaid: false,
            isDelivered: deliveryStatus,
            payosOrderCode: payosOrderCode || null,
            paymentLinkId: paymentLinkId || null,
        }], { session });

        const createdOrderDoc = Array.isArray(createdOrder) ? createdOrder[0] : createdOrder;

        // Tạo phiếu xuất kho
        const voucherCode = `PXK-PAYOS-${createdOrderDoc._id.toString().slice(-6).toUpperCase()}`;
        const voucherItems = normalizedOrderItems.map((item) => ({
            product: item.product,
            quantity: Number(item.amount || 0),
            unitPrice: Number(item.price || 0),
            amount: Number(item.amount || 0) * Number(item.price || 0),
        }));

        const saleVoucher = await InventoryVoucher.create([{
            voucherCode,
            transactionType: "EXPORT",
            exportReason: "SALE",
            performedBy: newOrder.adminId || user,
            linkedOrder: createdOrderDoc._id,
            voucherDate: new Date(),
            status: "confirmed",
            items: voucherItems,
            totalAmount: voucherItems.reduce((sum, item) => sum + item.amount, 0),
            note: `Xuat kho PayOS don hang ${createdOrderDoc._id}`,
            confirmedAt: new Date(),
            confirmedBy: newOrder.adminId || user,
        }], { session });

        const saleVoucherDoc = Array.isArray(saleVoucher) ? saleVoucher[0] : saleVoucher;

        const stockCardsToCreate = normalizedOrderItems.map((item) => ({
            product: item.product,
            date: new Date(),
            transactionType: "EXPORT",
            voucherCode,
            voucherRef: saleVoucherDoc._id,
            description: "Xuat kho - PAYOS SALE",
            quantityIn: 0,
            quantityOut: Number(item.amount || 0),
            balanceAfter: Number(item.countInStock || 0),
            performedBy: newOrder.adminId || user,
            note: `Lien ket don hang PayOS ${createdOrderDoc._id}`,
        }));

        await StockCard.insertMany(stockCardsToCreate, { session });

        await session.commitTransaction();
        session.endSession();
        session = null;

        const orderResponse = createdOrderDoc.toObject();
        if (orderResponse && Array.isArray(orderResponse.orderItems)) {
            orderResponse.orderItems.forEach(item => { delete item.image; });
        }

        return { status: 'OK', message: 'Pending order created!', data: orderResponse };

    } catch (e) {
        try { if (session) { await session.abortTransaction(); } } catch (abortErr) { console.error(abortErr); }
        finally { if (session) { session.endSession(); } }
        throw e;
    }
}

// =============================================
// PayOS: Hủy đơn hàng hết hạn + hoàn kho
// =============================================

/**
 * Hủy đơn hàng PayOS hết hạn thanh toán: hoàn kho, tạo phiếu nhập, xóa đơn.
 * Gọi khi nhận webhook PayOS code='01' (cancelled) hoặc frontend timeout.
 */
async function cancelExpiredOrder(orderId) {
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return { status: 'ERR', message: 'Order not found!' };
        }

        // Chỉ hủy đơn PayOS chưa thanh toán
        if (order.isPaid) {
            return { status: 'ERR', message: 'Cannot cancel a paid order!' };
        }

        // Hoàn lại hàng tồn kho
        if (order.isDelivered === 'pending' || order.isDelivered === 'processing') {
            const orderOwner = await User.findById(order.user);
            const ownerFullName = order?.shippingAddress?.fullName || orderOwner?.name || 'Khach hang';
            const ownerPhone = order?.shippingAddress?.phone || orderOwner?.phone || '--';
            const ownerEmail = orderOwner?.email || '--';
            const ownerContactInfo = `${ownerFullName} - ${ownerPhone} - ${ownerEmail}`;
            const voucherItems = [];

            for (const item of order.orderItems) {
                const quantity = Number(item.amount || 0);
                const unitPrice = Number(item.price || 0);
                const amount = quantity * unitPrice;

                const updatedProduct = await Product.findByIdAndUpdate(item.product, {
                    $inc: { countInStock: +quantity, sold: -quantity },
                    $set: { lastStockMovementAt: new Date() },
                }, { new: true });

                if (updatedProduct) {
                    const oldStock = updatedProduct.countInStock - quantity;
                    require("./ProductService").triggerRestockNotifications(updatedProduct, oldStock).catch(err => {
                        console.error("Restock notification error:", err);
                    });
                }

                voucherItems.push({ product: item.product, quantity, unitPrice, amount });
            }

            const voucherCode = `PNK-PAYOS-CANCEL-${order._id.toString().slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

            const importVoucher = await InventoryVoucher.create({
                voucherCode,
                transactionType: 'IMPORT',
                sourceType: 'RETURN',
                performedBy: order.user,
                linkedOrder: order._id,
                supplierName: ownerFullName,
                supplierContact: ownerContactInfo,
                voucherDate: new Date(),
                status: 'confirmed',
                items: voucherItems,
                totalAmount: voucherItems.reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
                note: `Nhap kho do PayOS het han don hang ${order._id}`,
                confirmedAt: new Date(),
                confirmedBy: order.user,
            });

            for (const item of voucherItems) {
                const productData = await Product.findById(item.product);
                await StockCard.create({
                    product: item.product,
                    date: new Date(),
                    transactionType: 'IMPORT',
                    voucherCode,
                    voucherRef: importVoucher._id,
                    description: 'Nhap kho - PAYOS RETURN',
                    quantityIn: item.quantity,
                    quantityOut: 0,
                    balanceAfter: productData?.countInStock || 0,
                    performedBy: order.user,
                    note: `Hoan kho PayOS het han don hang ${order._id}`,
                });
            }
        }

        await Order.findByIdAndDelete(orderId);
        return { status: 'OK', message: 'Expired order cancelled and stock restored!' };

    } catch (error) {
        throw error;
    }
}