const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
    {
        orderItems: [
            {
                name: { type: String, require: true },
                amount: { type: Number, require: true },
                image: { type: String, require: true },
                price: { type: Number, require: true },
                discount: { type: Number },
                countInStock: { type: Number },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    require: true,
                },
                // Nguồn gốc đơn hàng: theo dõi AI impact per-item
                orderSource: {
                    type: String,
                    enum: ["organic", "chatbot", "rag_recommendation"],
                    default: "organic",
                },
            },
        ],

        shippingAddress: {
            fullName: { type: String, require: true },
            address: { type: String, require: true },
            city: { type: String, require: true },
            phone: { type: String, require: true },
        },
        paymentMethod: { type: String, require: true },
        itemsPrice: { type: Number, require: true },
        shippingPrice: { type: Number, require: true },
        totalPrice: { type: Number, require: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
        isDelivered: { type: String, default: "pending" },
        // PayOS fields
        payosOrderCode: { type: Number, default: null },   // Mã số PayOS (số nguyên)
        paymentLinkId: { type: String, default: null },    // ID payment link từ PayOS
    },
    {
        timestamps: true,
    }
);

// Thêm các index để tối ưu hóa truy vấn thống kê doanh thu
orderSchema.index({ createdAt: -1, isPaid: 1 });
orderSchema.index({ isPaid: 1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;