const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const EmailService = require('./EmailService')
const User = require("../models/UserModel");
const InventoryVoucher = require("../models/InventoryVoucherModel");
const StockCard = require("../models/StockCardModel");


const createOrder = (newOrder) => {
    return new Promise(async (resolve, reject) => {
        const { orderItems, paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, phone, user, isPaid, paidAt } = newOrder;

        const updatedProducts = []; //Lưu lại các sản phẩm đã cập nhật
        const failedItems = [];

        try {
            // Duyệt từng sản phẩm để cập nhật kho
            for (const order of orderItems) {
                const productData = await Product.findOneAndUpdate(
                    {
                        _id: order.product,
                        countInStock: { $gte: order.amount }
                    },
                    {
                        $inc: {
                            countInStock: -order.amount,
                            sold: +order.amount,
                        },
                        $set: {
                            lastStockMovementAt: new Date(),
                        },
                    },
                    { new: true }
                );

                if (!productData) {
                    failedItems.push(order.product);
                    break; // ngưng cập nhật tiếp nếu có lỗi
                }

                // Lưu lại sản phẩm đã cập nhật thành công để rollback nếu cần
                updatedProducts.push({ productId: order.product, amount: order.amount });
            }

            // Nếu có lỗi → rollback các sản phẩm đã cập nhật
            if (failedItems.length > 0) {
                for (const item of updatedProducts) {
                    await Product.findByIdAndUpdate(item.productId, {
                        $inc: {
                            countInStock: +item.amount,
                            sold: -item.amount,
                        }
                    });
                }

                return resolve({
                    status: 'ERR',
                    message: `Số lượng tồn kho của sản phẩm ${failedItems.join(', ')} không đủ!`
                });
            }

            //check user có tồn tại không
            const userData = await User.findById(user);
            if (!userData) {
                return resolve({
                    status: 'ERR',
                    message: `User not found!`
                });
            }


            const sendEmailOrder = await EmailService.sendEmailOrder({ email: userData.email, orderItems, totalPrice })
            // Tạo đơn hàng duy nhất sau khi kiểm tra và cập nhật kho thành công
            const createdOrder = await Order.create({
                orderItems,
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
            });

            const voucherCode = `PXK-ORDER-${createdOrder._id.toString().slice(-6).toUpperCase()}`;
            const voucherItems = orderItems.map((item) => ({
                product: item.product,
                quantity: Number(item.amount || 0),
                unitPrice: Number(item.price || 0),
                amount: Number(item.amount || 0) * Number(item.price || 0),
            }));

            const saleVoucher = await InventoryVoucher.create({
                voucherCode,
                transactionType: "EXPORT",
                exportReason: "SALE",
                performedBy: user,
                linkedOrder: createdOrder._id,
                voucherDate: new Date(),
                status: "confirmed",
                items: voucherItems,
                totalAmount: voucherItems.reduce((sum, item) => sum + item.amount, 0),
                note: `Xuat kho tu don hang ${createdOrder._id}`,
                confirmedAt: new Date(),
            });

            for (const item of orderItems) {
                const productData = await Product.findById(item.product);
                await StockCard.create({
                    product: item.product,
                    date: new Date(),
                    transactionType: "EXPORT",
                    voucherCode,
                    voucherRef: saleVoucher._id,
                    description: "Xuat kho - SALE",
                    quantityIn: 0,
                    quantityOut: Number(item.amount || 0),
                    balanceAfter: productData?.countInStock || 0,
                    performedBy: user,
                    note: `Lien ket don hang ${createdOrder._id}`,
                });
            }

            return resolve({
                status: 'OK',
                message: 'Order placed successfully!',
                data: createdOrder
            });

        } catch (e) {
            // Trong trường hợp lỗi bất ngờ khác → rollback luôn
            for (const item of updatedProducts) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: {
                        countInStock: +item.amount,
                        sold: -item.amount,
                    }
                });
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

            const query = Order.find({ user: userId }).sort({ createdAt: -1 });

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

                    await Product.findByIdAndUpdate(item.product, {
                        $inc: {
                            countInStock: +quantity,
                            sold: -quantity,
                        },
                        $set: {
                            lastStockMovementAt: new Date(),
                        },
                    });

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
const getAllOrders = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const orders = await Order.find()
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

            const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
            if (!userData.isAdmin && order.user.toString() !== userId.toString()) {
                return resolve({
                    status: 'ERR',
                    message: 'Unauthorized: You can only update your own orders!'
                });
            }


            if (!order) {
                return resolve({
                    status: 'ERR',
                    message: 'Order not found!'
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
    updateOrder
};