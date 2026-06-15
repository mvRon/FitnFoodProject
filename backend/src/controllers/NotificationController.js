const NotificationService = require("../services/NotificationService");
const { emitToAdmin, broadcastFlashSale } = require("../socket/notificationSocket");

/**
 * GET /api/notification
 * Lấy danh sách notifications của user/admin đang đăng nhập (tối đa 50)
 */
const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        const recipientType = req.user?.isAdmin ? "admin" : "user";
        const result = await NotificationService.getNotifications(userId, recipientType);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ status: "ERR", message: e.message });
    }
};

/**
 * GET /api/notification/unread-count
 * Đếm số thông báo chưa đọc
 */
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user?.id;
        const recipientType = req.user?.isAdmin ? "admin" : "user";
        const result = await NotificationService.getUnreadCount(userId, recipientType);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ status: "ERR", message: e.message });
    }
};

/**
 * PATCH /api/notification/:id/read
 * Đánh dấu một notification đã đọc
 */
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const isAdmin = req.user?.isAdmin;
        const result = await NotificationService.markAsRead(id, userId, isAdmin);
        const statusCode = result.status === "OK" ? 200 : 400;
        return res.status(statusCode).json(result);
    } catch (e) {
        return res.status(500).json({ status: "ERR", message: e.message });
    }
};

/**
 * PATCH /api/notification/read-all
 * Đánh dấu tất cả notifications đã đọc
 */
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user?.id;
        const recipientType = req.user?.isAdmin ? "admin" : "user";
        const result = await NotificationService.markAllAsRead(userId, recipientType);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ status: "ERR", message: e.message });
    }
};

/**
 * POST /api/notification/flash-sale
 * Admin broadcast Flash Sale đến tất cả user
 */
const broadcastFlashSaleNotification = async (req, res) => {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ status: "ERR", message: "Admin access required" });
        }

        const { title, message, metadata } = req.body;

        if (!title?.trim() || !message?.trim()) {
            return res.status(200).json({ status: "ERR", message: "Title and message are required" });
        }

        const notification = await NotificationService.createNotification({
            recipient: null,
            recipientType: "all",
            type: "FLASH_SALE",
            title: title.trim(),
            message: message.trim(),
            metadata: metadata || {},
        });

        // Broadcast realtime đến tất cả user online (kể cả guest)
        broadcastFlashSale(notification);

        return res.status(200).json({ status: "OK", data: notification });
    } catch (e) {
        return res.status(500).json({ status: "ERR", message: e.message });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    broadcastFlashSaleNotification,
};
