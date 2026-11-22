const mongoose = require("mongoose");

const paymentOutboxSchema = new mongoose.Schema(
    {
        dedupKey: { type: String, required: true, unique: true },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        eventType: {
            type: String,
            enum: ["ORDER_PAID", "PAYMENT_FAILED", "PAYMENT_CANCELLED"],
            required: true,
        },
        payload: { type: mongoose.Schema.Types.Mixed, required: true },
        status: {
            type: String,
            enum: ["pending", "processing", "processed", "failed"],
            default: "pending",
        },
        attempts: { type: Number, default: 0 },
        nextAttemptAt: { type: Date, default: Date.now },
        lockedAt: { type: Date, default: null },
        processedAt: { type: Date, default: null },
        lastError: { type: String, default: null },
    },
    { timestamps: true }
);

paymentOutboxSchema.index({ status: 1, nextAttemptAt: 1, createdAt: 1 });

module.exports = mongoose.model("PaymentOutbox", paymentOutboxSchema);
