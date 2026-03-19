const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
    {
        name: { type: String, require: true, unique: true },
        images: [{ type: String, require: true }],
        type: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        // type: { type: String, require: true },
        price: { type: Number, require: true },
        countInStock: { type: Number, require: true },
        rating: { type: Number, require: true },
        description: { type: String },
        discount: { type: Number },
        sold: { type: Number },
        lastStockMovementAt: { type: Date, default: Date.now },
        reviews: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                comment: { type: String },
                rating: { type: Number },
                createdAt: { type: Date, default: Date.now },
                replies: [
                    {
                        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                        comment: { type: String, required: true },
                        createdAt: { type: Date, default: Date.now }
                    }
                ]
            }
        ],
        numReviews: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 }
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;