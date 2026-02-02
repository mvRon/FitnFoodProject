const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const EmailService = require('./EmailService')
const User = require("../models/UserModel");


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
                        }
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
const getUserOrders = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // const orders = await Order.find({ user: userId }).populate('orderItems.product');
            const orders = await Order.find({ user: userId })


            if (!orders || orders.length === 0) {
                return resolve({
                    status: 'OK',
                    message: 'No orders found',
                    data: []
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
            const userData = await User.findById(userId);

            //Kiểm tra xem người dùng có phải là chủ sở hữu đơn hàng hay không và có phải admin không
            if (!userData.isAdmin && order.user.toString() !== userId.toString()) {
                return resolve({
                    status: 'ERR',
                    message: 'Unauthorized: You can only view your own orders!'
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
                for (const item of order.orderItems) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: {
                            countInStock: +item.amount,
                            sold: -item.amount,
                        }
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