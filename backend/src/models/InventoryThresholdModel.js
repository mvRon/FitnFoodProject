const mongoose = require("mongoose");

const inventoryThresholdSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            unique: true,
        },
        safeStockLevel: { type: Number, default: 0, min: 0 },
        maxStorageDays: { type: Number, default: 90, min: 1 },
        note: { type: String },
    },
    {
        timestamps: true,
    }
);

const InventoryThreshold = mongoose.model("InventoryThreshold", inventoryThresholdSchema);
module.exports = InventoryThreshold;
