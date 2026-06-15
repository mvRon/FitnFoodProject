const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/NotificationController");
const { authMiddleWare, authUserMiddleWare } = require("../middleware/authMiddleware");

// Lấy danh sách notifications (admin hoặc user đã đăng nhập)
router.get("/", authUserMiddleWare, NotificationController.getNotifications);

// Đếm số thông báo chưa đọc
router.get("/unread-count", authUserMiddleWare, NotificationController.getUnreadCount);

// Đánh dấu một notification đã đọc
router.patch("/:id/read", authUserMiddleWare, NotificationController.markAsRead);

// Đánh dấu tất cả đã đọc
router.patch("/read-all", authUserMiddleWare, NotificationController.markAllAsRead);

// Admin: broadcast Flash Sale (chỉ admin)
router.post("/flash-sale", authMiddleWare, NotificationController.broadcastFlashSaleNotification);

module.exports = router;
