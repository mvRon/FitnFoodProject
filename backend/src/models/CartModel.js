const mongoose = require('mongoose')


const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: { type: String, required: true },
    amount: { type: Number, required: true, default: 1 },
    image: { type: String },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    countInStock: { type: Number, required: true }
})

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema]
},
    {
        timestamps: true
    }
)

const Cart = mongoose.model('Cart', cartSchema)

module.exports = { Cart }