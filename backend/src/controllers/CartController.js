const { Cart } = require("../models/CartModel");

// Get cart by userId
const getCart = async (req, res) => {
    const userId = req.params.userId
    try {
        // const cart = await Cart.findOne({ userId }).populate('items.product')
        const cart = await Cart.findOne({ userId })
        if (!cart) {
            return res.status(200).json({
                status: "OK",
                message: 'Cart retrieved successfully (empty)!',
                data: { items: [] }
            })
        }

        res.status(200).json({
            status: "OK",
            message: "Cart retrieved successfully!",
            data: cart
        })
    } catch (error) {
        console.error('Get Cart Error:', error)
        res.status(500).json({
            status: "ERR",
            message: error.message
        })
    }
}

// Add/update cart
const updateCart = async (req, res) => {
    const { userId, items } = req.body
    try {
        if (!userId || !items) {
            return res.status(400).json({
                status: "ERR",
                message: 'User ID and items are required!'
            })
        }
        let cart = await Cart.findOne({ userId })
        if (cart) {
            cart.items = items
            await cart.save()
        } else {
            cart = await Cart.create({ userId, items })
        }
        res.status(200).json({
            status: "OK",
            message: "Cart updated successfully!",
            data: cart
        })
    } catch (error) {
        res.status(500).json({
            status: "ERR",
            message: error.message
        })
    }
}

// Delete cart
const deleteCart = async (req, res) => {
    try {
        const userId = req.params.userId
        if (!userId) {
            return res.status(400).json({
                status: "ERR",
                message: 'User ID is required!'
            })
        }
        const cart = await Cart.findOneAndDelete({ userId })
        if (!cart) {
            return res.status(404).json({
                status: "ERR",
                message: 'Cart not found!'
            })
        }
        res.status(200).json({
            status: "OK",
            message: 'Cart deleted successfully!'
        })
    } catch (error) {
        res.status(500).json({
            status: "ERR",
            message: error.message
        })
    }
}


module.exports = {
    getCart,
    updateCart,
    deleteCart,
}