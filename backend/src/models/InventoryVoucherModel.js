const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: { type: Number, required: true, min: 0 },
        unitPrice: { type: Number, default: 0, min: 0 },
        amount: { type: Number, default: 0, min: 0 },
    },
    { _id: false }
);

const inventoryVoucherSchema = new mongoose.Schema(
    {
        voucherCode: { type: String, required: true, unique: true },
        transactionType: {
            type: String,
            enum: ["IMPORT", "EXPORT"],
            required: true,
        },
        sourceType: {
            type: String,
            enum: ["SUPPLIER", "RETURN", "ADJUSTMENT", "PRODUCTION", "OTHER"],
            default: "OTHER",
        },
        exportReason: {
            type: String,
            enum: ["SALE", "ORDER_CANCEL", "RETURN_SUPPLIER", "DAMAGE", "LOSS", "ADJUSTMENT", "OTHER"],
            default: "OTHER",
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        supplierName: { type: String },
        supplierContact: { type: String },
        linkedOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
        voucherDate: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ["draft", "pending", "confirmed", "cancelled"],
            default: "confirmed",
        },
        items: [inventoryItemSchema],
        totalAmount: { type: Number, default: 0, min: 0 },
        note: { type: String },
        confirmedAt: { type: Date },
        confirmedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        cancelledAt: { type: Date },
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

const InventoryVoucher = mongoose.model("InventoryVoucher", inventoryVoucherSchema);
module.exports = InventoryVoucher;
