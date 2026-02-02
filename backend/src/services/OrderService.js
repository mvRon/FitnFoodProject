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
            if(!userData){
                return resolve({
                    status: 'ERR',
                    message: `User not found!`
                });
            }


            const sendEmailOrder = await EmailService.sendEmailOrder({email: userData.email, orderItems, totalPrice})
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


module.exports = {
    createOrder,
};