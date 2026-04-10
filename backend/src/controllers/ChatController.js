const ChatService = require("../services/ChatService");

const getOrCreateConversation = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: "ERR",
                message: "User authentication required!",
            });
        }

        const result = await ChatService.getOrCreateConversation(userId);
        return res.status(200).json({
            status: "OK",
            message: "Conversation ready!",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error?.message || "Something went wrong!",
        });
    }
};

const getConversationMessages = async (req, res) => {
    try {
        const conversationId = req.params.id;
        if (!conversationId) {
            return res.status(400).json({
                status: "ERR",
                message: "Conversation ID is required!",
            });
        }

        const conversation = await ChatService.getConversationForUser(conversationId, req.user);
        if (!conversation) {
            return res.status(404).json({
                status: "ERR",
                message: "Conversation not found!",
            });
        }

        const messages = await ChatService.getMessages(conversationId);
        return res.status(200).json({
            status: "OK",
            message: "Messages loaded successfully!",
            data: messages,
        });
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error?.message || "Something went wrong!",
        });
    }
};

const getAdminConversations = async (req, res) => {
    try {
        const conversations = await ChatService.getAdminConversations();
        return res.status(200).json({
            status: "OK",
            message: "Conversations loaded successfully!",
            data: conversations,
        });
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error?.message || "Something went wrong!",
        });
    }
};

module.exports = {
    getOrCreateConversation,
    getConversationMessages,
    getAdminConversations,
};
