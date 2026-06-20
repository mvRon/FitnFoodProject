const jwt = require("jsonwebtoken");

// Module-level io reference cho /notification namespace
let _notifNamespace = null;

/**
 * Đăng ký Socket.IO namespace /notification
 * - Admin join "admin_room"
 * - User đăng nhập join "user_{userId}"
 * - Guest join "guest_room" (chỉ nhận Flash Sale)
 */
const registerNotificationSocket = (io) => {
    const notifNs = io.of("/notification");
    _notifNamespace = notifNs;

    // Middleware xác thực JWT (tương tự chatSocket)
    notifNs.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        const guestId = socket.handshake.auth?.guestId;

        if (token) {
            try {
                const user = jwt.verify(token, process.env.ACCESS_TOKEN);
                socket.user = user;
                return next();
            } catch {
                return next(new Error("Unauthorized"));
            }
        }

        if (guestId) {
            socket.user = { isGuest: true, guestId };
            return next();
        }

        // Cho phép kết nối không xác thực (nhận broadcast Flash Sale)
        socket.user = { isGuest: true };
        return next();
    });

    notifNs.on("connection", (socket) => {
        const user = socket.user;

        // Admin join admin_room
        if (user?.isAdmin) {
            socket.join("admin_room");
        }

        // Tất cả user đã đăng nhập join room riêng
        if (user?.id) {
            socket.join(`user_${user.id}`);
        }

        // Tất cả (kể cả guest) join guest_room để nhận Flash Sale
        socket.join("guest_room");

        socket.on("joinProductRoom", (productId) => {
            if (productId) {
                socket.join(`product_${productId}`);
            }
        });

        socket.on("leaveProductRoom", (productId) => {
            if (productId) {
                socket.leave(`product_${productId}`);
            }
        });

        socket.on("disconnect", () => {
            // Cleanup tự động khi disconnect
        });
    });

    console.log("[NotificationSocket] Namespace /notification registered");
};

/**
 * Emit thông báo đến Admin room
 * @param {Object} notification - notification object từ DB
 */
const emitToAdmin = (notification) => {
    if (!_notifNamespace) return;
    _notifNamespace.to("admin_room").emit("notification:new", notification);
};

/**
 * Emit thông báo đến một User cụ thể
 * @param {string} userId
 * @param {Object} notification - notification object từ DB
 */
const emitToUser = (userId, notification) => {
    if (!_notifNamespace || !userId) return;
    _notifNamespace.to(`user_${userId}`).emit("notification:new", notification);
};

/**
 * Broadcast Flash Sale đến tất cả user (kể cả guest)
 * @param {Object} notification - notification object từ DB
 */
const broadcastFlashSale = (notification) => {
    if (!_notifNamespace) return;
    _notifNamespace.emit("notification:new", notification);
};

/**
 * Emit cập nhật tồn kho realtime đến các user đang xem chi tiết sản phẩm đó
 * @param {string} productId 
 * @param {number} newStock 
 */
const emitProductStockUpdate = (productId, newStock) => {
    if (!_notifNamespace || !productId) return;
    _notifNamespace.to(`product_${productId}`).emit("product:stock_updated", { productId, countInStock: newStock });
};

module.exports = {
    registerNotificationSocket,
    emitToAdmin,
    emitToUser,
    broadcastFlashSale,
    emitProductStockUpdate,
};
