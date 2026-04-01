const OrderService = require("../services/OrderService")


const createOrder = async (req, res) => {
    try {
        const {
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            fullName,
            address,
            city,
            phone,
            isPaid,
            paidAt,
        } = req.body;
 
        if (
            paymentMethod == null ||
            itemsPrice == null ||
            shippingPrice == null ||
            totalPrice == null ||
            !fullName?.trim() ||
            !address?.trim() ||
            !city?.trim() ||
            !phone?.trim()
        ) {
            return res.status(200).json({
                status: "ERR",
                message: "All fields are required!",
            });
        }

        const userIdFromToken = req.user.id;
        const effectiveUserId = req.user?.isAdmin && req.body?.user
            ? req.body.user
            : userIdFromToken;
        const effectiveDeliveryStatus = req.user?.isAdmin
            ? req.body?.isDelivered
            : undefined;
        const response = await OrderService.createOrder({
            ...req.body,
            user: effectiveUserId,
            isDelivered: effectiveDeliveryStatus,
        });

        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e.message || "Something went wrong!"
        });
    }
};

// Lấy toàn bộ đơn hàng của người dùng
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = req.query.page ? Number(req.query.page) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : undefined;
        const includeImage = req.query.includeImage === 'true';

        const response = await OrderService.getUserOrders(userId, {
            page,
            limit,
            includeImage,
        });
        
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || "Something went wrong!"
        });
    }
};

// Lấy chi tiết đơn hàng
const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        const response = await OrderService.getOrderById(orderId, userId);

        if (response.status === 'ERR' && response.message?.includes('Unauthorized')) {
            return res.status(403).json(response);
        }

        if (response.status === 'ERR' && response.message === 'Order not found!') {
            return res.status(404).json(response);
        }
        
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || "Something went wrong!"
        });
    }
};

// Xóa đơn hàng
const deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        const response = await OrderService.deleteOrder(orderId, userId);
        
        const statusCode = response.status === 'OK' ? 200 : 400;
        return res.status(statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || "Something went wrong!"
        });
    }
};

// Lấy toàn bộ danh sách đơn hàng (Admin)
const getAllOrders = async (req, res) => {
    try {
        const includeImage = req.query.includeImage === 'true';
        const response = await OrderService.getAllOrders({ includeImage });
        
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || "Something went wrong!"
        });
    }
};


const updateOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const updateData = req.body;
        const userId = req.user.id;
        const response = await OrderService.updateOrder(orderId, updateData, userId);
        
        const statusCode = response.status === 'OK' ? 200 : 400;
        return res.status(statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || "Something went wrong!"
        });
    }   
};


module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    deleteOrder,
    getAllOrders,
    updateOrder
};