const jwt = require("jsonwebtoken");
const ChatService = require("../services/ChatService");
const NotificationService = require("../services/NotificationService");
const { emitToAdmin, emitToUser } = require("./notificationSocket");

const _triggerChatSupportNotification = async (conversation) => {
    try {
        const notification = await NotificationService.createNotification({
            recipientType: 'admin',
            type: 'CHAT_SUPPORT',
            title: 'Yêu cầu hỗ trợ mới',
            message: `Khách hàng đang chờ hỗ trợ tại phiên chat.`,
            metadata: { conversationId: String(conversation._id) },
        });
        emitToAdmin(notification);
    } catch (err) {
        console.error("[Notification] CHAT_SUPPORT trigger failed:", err);
    }
};

const _triggerChatReplyNotification = async (conversation) => {
    const userId = conversation?.customer?._id || conversation?.customer;
    if (!userId) return; // Guest không nhận qua chuông
    try {
        const notification = await NotificationService.createNotification({
            recipient: String(userId),
            recipientType: 'user',
            type: 'CHAT_REPLY',
            title: 'Phản hồi từ Admin',
            message: `Admin đã phản hồi tin nhắn hỗ trợ của bạn.`,
            metadata: { conversationId: String(conversation._id) },
        });
        emitToUser(String(userId), notification);
    } catch (err) {
        console.error("[Notification] CHAT_REPLY trigger failed:", err);
    }
};

const buildStatusPayload = (conversation) => ({
    conversationId: String(conversation?._id || ""),
    status: conversation?.status,
    admin: conversation?.admin || null,
    customer: conversation?.customer || null,
    lastMessageAt: conversation?.lastMessageAt,
});

const registerChatSocket = (io) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        const guestId = socket.handshake.auth?.guestId;

        if (token) {
            try {
                const user = jwt.verify(token, process.env.ACCESS_TOKEN);
                socket.user = user;
                return next();
            } catch (error) {
                return next(new Error("Unauthorized"));
            }
        }

        if (guestId) {
            socket.user = { isGuest: true, guestId };
            return next();
        }

        return next(new Error("Unauthorized"));
    });

    io.on("connection", (socket) => {
        const user = socket.user;

        if (user?.isAdmin) {
            socket.join("admin_notifications");
        }

        socket.on("chat:join", async ({ conversationId }) => {
            const conversation = await ChatService.getConversationForUser(conversationId, user, user?.guestId);
            if (!conversation) {
                socket.emit("chat:error", { message: "Conversation not found" });
                return;
            }

            socket.join(conversationId);
            socket.emit("chat:status", buildStatusPayload(conversation));
        });

        // Tham gia phòng theo dõi thanh toán PayOS (dùng cho real-time webhook)
        socket.on("payment:join", ({ orderId }) => {
            if (!orderId) return;
            socket.join(`payment:${orderId}`);
        });

        // Rời phòng theo dõi thanh toán
        socket.on("payment:leave", ({ orderId }) => {
            if (!orderId) return;
            socket.leave(`payment:${orderId}`);
        });

        socket.on("chat:send", async ({ conversationId, content }) => {
            const messageText = String(content || "").trim();
            if (!messageText) return;

            let conversation = null;
            if (conversationId) {
                conversation = await ChatService.getConversationForUser(conversationId, user, user?.guestId);
            }

            if (!conversation) {
                if (!user?.id && !user?.guestId) {
                    socket.emit("chat:error", { message: "User authentication required" });
                    return;
                }
                conversation = await ChatService.createConversation({
                    customerId: user?.id || null,
                    guestId: user?.guestId || null,
                });
                conversationId = String(conversation._id);
                socket.emit("chat:conversation", { conversation });
            }

            socket.join(conversationId);

            const userMessage = await ChatService.createMessage({
                conversationId,
                sender: "user",
                content: messageText,
            });
            io.to(conversationId).emit("chat:message", userMessage);

            if (user?.isGuest) {
                if (conversation.status === "bot_active") {
                    const updated = await ChatService.updateConversationStatus(conversationId, "waiting_for_admin");
                    io.to(conversationId).emit("chat:status", buildStatusPayload(updated));
                    io.to("admin_notifications").emit("chat:handoff_request", buildStatusPayload(updated));
                    _triggerChatSupportNotification(updated);
                }
                return;
            }

            if (conversation.status === "bot_active") {
                // Status callback để stream progress cho user
                const statusCallback = (statusText) => {
                    io.to(conversationId).emit("chat:bot_status", { status: statusText });
                };

                const botResult = await ChatService.generateBotMessage(
                    messageText,
                    conversationId,
                    user?.id || null,
                    statusCallback
                );
                const botMessage = await ChatService.createMessage({
                    conversationId,
                    sender: "bot",
                    content: botResult.text,
                    metadata: {
                        productIds: botResult.productIds,
                        actions: botResult.actions || [],
                        cartUpdate: botResult.cartUpdate || undefined,
                        orderCreated: botResult.orderCreated || undefined,
                    },
                });
                if (botMessage.metadata) {
                    botMessage.metadata.products = botResult.products;
                }
                io.to(conversationId).emit("chat:message", botMessage);

                // Emit cart update event nếu giỏ hàng thay đổi
                if (botResult.sideEffects?.cartUpdated) {
                    io.to(conversationId).emit("chat:cart_updated", {
                        items: botResult.sideEffects.cartItems || [],
                        totalItems: (botResult.sideEffects.cartItems || []).reduce(
                            (sum, item) => sum + (item.amount || 0), 0
                        ),
                    });
                }

                // Emit order created event nếu đặt hàng COD thành công
                if (botResult.sideEffects?.orderCreated) {
                    io.to(conversationId).emit("chat:order_created", {
                        orderId: botResult.sideEffects.orderId,
                        totalPrice: botResult.sideEffects.orderTotalPrice,
                    });
                }

                // Emit PayOS payment link nếu bot tạo đơn PayOS
                if (botResult.sideEffects?.payosLink) {
                    io.to(conversationId).emit("chat:payos_link", {
                        orderId: botResult.sideEffects.orderId,
                        checkoutUrl: botResult.sideEffects.payosLink,
                        totalPrice: botResult.sideEffects.orderTotalPrice,
                    });
                }
            }
        });

        // Xử lý Quick Reply button clicks từ frontend
        socket.on("chat:action", async ({ conversationId, actionType, payload }) => {
            if (!conversationId || !actionType) return;

            const conversation = await ChatService.getConversationForUser(conversationId, user, user?.guestId);
            if (!conversation) {
                socket.emit("chat:error", { message: "Conversation not found" });
                return;
            }

            // Map action type sang message text tương ứng
            let messageText = "";
            if (actionType === "confirm_order") {
                messageText = "Xác nhận đặt hàng";
            } else if (actionType === "select_voucher" && payload?.voucherCode) {
                messageText = `Tôi chọn mã giảm giá ${payload.voucherCode}`;
            } else if (actionType === "quick_reply" && payload?.text) {
                messageText = payload.text;
            } else {
                return;
            }

            // Lưu tin nhắn user
            const userMessage = await ChatService.createMessage({
                conversationId,
                sender: "user",
                content: messageText,
            });
            io.to(conversationId).emit("chat:message", userMessage);

            // Xử lý bot response giống chat:send
            if (conversation.status === "bot_active") {
                const statusCallback = (statusText) => {
                    io.to(conversationId).emit("chat:bot_status", { status: statusText });
                };

                const botResult = await ChatService.generateBotMessage(
                    messageText,
                    conversationId,
                    user?.id || null,
                    statusCallback
                );
                const botMessage = await ChatService.createMessage({
                    conversationId,
                    sender: "bot",
                    content: botResult.text,
                    metadata: {
                        productIds: botResult.productIds,
                        actions: botResult.actions || [],
                        cartUpdate: botResult.cartUpdate || undefined,
                        orderCreated: botResult.orderCreated || undefined,
                    },
                });
                if (botMessage.metadata) {
                    botMessage.metadata.products = botResult.products;
                }
                io.to(conversationId).emit("chat:message", botMessage);

                if (botResult.sideEffects?.cartUpdated) {
                    io.to(conversationId).emit("chat:cart_updated", {
                        items: botResult.sideEffects.cartItems || [],
                        totalItems: (botResult.sideEffects.cartItems || []).reduce(
                            (sum, item) => sum + (item.amount || 0), 0
                        ),
                    });
                }

                if (botResult.sideEffects?.orderCreated) {
                    io.to(conversationId).emit("chat:order_created", {
                        orderId: botResult.sideEffects.orderId,
                        totalPrice: botResult.sideEffects.orderTotalPrice,
                    });
                }

                // Emit PayOS payment link nếu bot tạo đơn PayOS (qua chat:action)
                if (botResult.sideEffects?.payosLink) {
                    io.to(conversationId).emit("chat:payos_link", {
                        orderId: botResult.sideEffects.orderId,
                        checkoutUrl: botResult.sideEffects.payosLink,
                        totalPrice: botResult.sideEffects.orderTotalPrice,
                    });
                }
            }
        });

        socket.on("chat:typing", ({ conversationId, isTyping }) => {
            if (!conversationId) return;
            socket.to(conversationId).emit("chat:typing", {
                sender: user?.isAdmin ? "admin" : "user",
                isTyping: !!isTyping,
            });
        });

        socket.on("chat:handoff", async ({ conversationId }) => {
            const conversation = await ChatService.getConversationForUser(conversationId, user, user?.guestId);
            if (!conversation) {
                socket.emit("chat:error", { message: "Conversation not found" });
                return;
            }

            const updated = await ChatService.updateConversationStatus(conversationId, "waiting_for_admin");
            io.to(conversationId).emit("chat:status", buildStatusPayload(updated));
            io.to("admin_notifications").emit("chat:handoff_request", buildStatusPayload(updated));
            _triggerChatSupportNotification(updated);
        });

        socket.on("admin:accept", async ({ conversationId }) => {
            if (!user?.isAdmin) {
                socket.emit("chat:error", { message: "Admin authentication required" });
                return;
            }

            const updated = await ChatService.updateConversationStatus(conversationId, "admin_active", user.id);
            if (!updated) {
                socket.emit("chat:error", { message: "Conversation not found" });
                return;
            }

            socket.join(conversationId);
            io.to(conversationId).emit("chat:status", buildStatusPayload(updated));
            io.to("admin_notifications").emit("chat:handoff_request", buildStatusPayload(updated));
        });

        socket.on("admin:send", async ({ conversationId, content }) => {
            if (!user?.isAdmin) {
                socket.emit("chat:error", { message: "Admin authentication required" });
                return;
            }

            const messageText = String(content || "").trim();
            if (!messageText) return;

            const conversation = await ChatService.getConversationForUser(conversationId, user, user?.guestId);
            if (!conversation) {
                socket.emit("chat:error", { message: "Conversation not found" });
                return;
            }

            socket.join(conversationId);
            const adminMessage = await ChatService.createMessage({
                conversationId,
                sender: "admin",
                content: messageText,
            });
            io.to(conversationId).emit("chat:message", adminMessage);
            _triggerChatReplyNotification(conversation);
        });

        socket.on("chat:close", async ({ conversationId }) => {
            const conversation = await ChatService.getConversationForUser(conversationId, user, user?.guestId);
            if (!conversation) {
                socket.emit("chat:error", { message: "Conversation not found" });
                return;
            }

            const updated = await ChatService.updateConversationStatus(conversationId, "bot_active");
            io.to(conversationId).emit("chat:status", buildStatusPayload(updated));
            io.to("admin_notifications").emit("chat:handoff_request", buildStatusPayload(updated));
        });

        socket.on("disconnect", async () => {
            if (!user?.isGuest || !user?.guestId) return;

            try {
                await ChatService.deleteGuestConversations(user.guestId);
                io.to("admin_notifications").emit("chat:handoff_request", {
                    guestId: user.guestId,
                    status: "closed",
                });
            } catch (error) {
                console.warn("Guest chat cleanup failed:", error?.message || error);
            }
        });
    });
};

module.exports = registerChatSocket;
