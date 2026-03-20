const mongoose = require("mongoose");

const stockCardSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        date: { type: Date, default: Date.now },
        transactionType: {
            type: String,
            enum: ["IMPORT", "EXPORT", "ADJUSTMENT"],
            required: true,
        },
        voucherCode: { type: String, required: true },
        voucherRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InventoryVoucher",
            required: true,
        },
        description: { type: String },
        quantityIn: { type: Number, default: 0, min: 0 },
        quantityOut: { type: Number, default: 0, min: 0 },
        balanceAfter: { type: Number, required: true },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        note: { type: String },
    },
    {
        timestamps: true,
    }
);

const StockCard = mongoose.model("StockCard", stockCardSchema);
module.exports = StockCard;
