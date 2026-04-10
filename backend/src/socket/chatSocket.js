const jwt = require("jsonwebtoken");
const ChatService = require("../services/ChatService");

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
                }
                return;
            }

            if (conversation.status === "bot_active") {
                const botResult = await ChatService.generateBotMessage(messageText);
                const botMessage = await ChatService.createMessage({
                    conversationId,
                    sender: "bot",
                    content: botResult.text,
                    metadata: {
                        productIds: botResult.productIds,
                        products: botResult.products,
                    },
                });
                io.to(conversationId).emit("chat:message", botMessage);
            }
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
