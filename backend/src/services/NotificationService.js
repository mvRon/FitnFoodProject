const Notification = require("../models/NotificationModel");

/**
 * Tạo và lưu một notification vào database
 * @param {Object} data - { recipient, recipientType, type, title, message, metadata }
 * @returns {Promise<Notification>}
 */
const createNotification = async (data) => {
    try {
        const notification = await Notification.create({
            recipient: data.recipient || null,
            recipientType: data.recipientType,
            type: data.type,
            title: data.title,
            message: data.message,
            metadata: data.metadata || {},
            isRead: false,
        });
        return notification;
    } catch (error) {
        console.error("[NotificationService] createNotification error:", error);
        throw error;
    }
};

/**
 * Lấy danh sách notifications (tối đa 50 bản ghi gần nhất)
 * - Admin: recipientType = 'admin'
 * - User: recipientType = 'user' AND (recipient = userId OR recipientType = 'all')
 */
const getNotifications = async (userId, recipientType) => {
    try {
        let query;
        if (recipientType === "admin") {
            // Admin nhận thông báo hệ thống + thông báo cá nhân (đơn hàng của chính admin)
            query = {
                $or: [
                    { recipientType: "admin" },
                    { recipientType: "user", recipient: userId },
                    { recipientType: "all" },
                ],
            };
        } else {
            // User nhận thông báo cá nhân + broadcast (FLASH_SALE)
            query = {
                $or: [
                    { recipientType: "user", recipient: userId },
                    { recipientType: "all" },
                ],
            };
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return { status: "OK", data: notifications };
    } catch (error) {
        return { status: "ERR", message: error.message };
    }
};

/**
 * Đếm số thông báo chưa đọc
 */
const getUnreadCount = async (userId, recipientType) => {
    try {
        let query;
        if (recipientType === "admin") {
            query = {
                isRead: false,
                $or: [
                    { recipientType: "admin" },
                    { recipientType: "user", recipient: userId },
                    { recipientType: "all" },
                ],
            };
        } else {
            query = {
                isRead: false,
                $or: [
                    { recipientType: "user", recipient: userId },
                    { recipientType: "all" },
                ],
            };
        }

        const count = await Notification.countDocuments(query);
        return { status: "OK", data: count };
    } catch (error) {
        return { status: "ERR", message: error.message };
    }
};

/**
 * Đánh dấu một notification đã đọc
 */
const markAsRead = async (notificationId, userId, isAdmin) => {
    try {
        let filter = { _id: notificationId };
        if (!isAdmin) {
            // User chỉ được đánh dấu notification của chính mình hoặc broadcast
            filter = {
                _id: notificationId,
                $or: [
                    { recipientType: "user", recipient: userId },
                    { recipientType: "all" },
                ],
            };
        }

        const updated = await Notification.findOneAndUpdate(
            filter,
            { isRead: true },
            { new: true }
        );

        if (!updated) {
            return { status: "ERR", message: "Notification not found or unauthorized" };
        }

        return { status: "OK", data: updated };
    } catch (error) {
        return { status: "ERR", message: error.message };
    }
};

/**
 * Đánh dấu tất cả notifications đã đọc
 */
const markAllAsRead = async (userId, recipientType) => {
    try {
        let filter;
        if (recipientType === "admin") {
            filter = {
                isRead: false,
                $or: [
                    { recipientType: "admin" },
                    { recipientType: "user", recipient: userId },
                    { recipientType: "all" },
                ],
            };
        } else {
            filter = {
                isRead: false,
                $or: [
                    { recipientType: "user", recipient: userId },
                    { recipientType: "all" },
                ],
            };
        }

        await Notification.updateMany(filter, { isRead: true });
        return { status: "OK", message: "All notifications marked as read" };
    } catch (error) {
        return { status: "ERR", message: error.message };
    }
};

/**
 * Kiểm tra xem đã có notification LOW_STOCK chưa đọc cho sản phẩm này chưa
 * (Tránh spam cảnh báo tồn kho)
 */
const hasUnreadLowStockNotification = async (productId) => {
    try {
        const existing = await Notification.findOne({
            type: "LOW_STOCK",
            recipientType: "admin",
            isRead: false,
            "metadata.productId": String(productId),
        });
        return !!existing;
    } catch (error) {
        return false;
    }
};

module.exports = {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    hasUnreadLowStockNotification,
};
