const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        // null = broadcast cho tất cả (Flash Sale cho guest)
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        recipientType: {
            type: String,
            enum: ["admin", "user", "all"],
            required: true,
        },
        type: {
            type: String,
            enum: [
                "LOW_STOCK",        // Admin: tồn kho dưới ngưỡng
                "NEW_ORDER",        // Admin: đơn hàng mới
                "CHAT_SUPPORT",     // Admin: yêu cầu hỗ trợ CSKH
                "PAYMENT_FAILED",   // Admin: thanh toán thất bại
                "ORDER_STATUS",     // User: cập nhật trạng thái đơn hàng
                "RESTOCK",          // User: sản phẩm đã có hàng trở lại
                "FLASH_SALE",       // All: flash sale / khuyến mãi
                "CHAT_REPLY",       // User: admin phản hồi chat
            ],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        // Dữ liệu đính kèm (orderId, productId, v.v.) để navigate khi click
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
        isRead: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// TTL index: tự động xóa notification sau 30 ngày
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Index để query nhanh
notificationSchema.index({ recipient: 1, recipientType: 1, createdAt: -1 });
notificationSchema.index({ recipientType: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
