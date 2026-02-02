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
        const response = await OrderService.createOrder({
            ...req.body,
            user: userIdFromToken, // ⚠️ Ghi đè user cho an toàn
        });

        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e.message || "Something went wrong"
        });
    }
};



module.exports = {
    createOrder,

};