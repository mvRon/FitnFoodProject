const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/ChatController");
const { authMiddleWare, authUserMiddleWare } = require("../middleware/authMiddleware");

router.get("/get-or-create-conversation", authUserMiddleWare, ChatController.getOrCreateConversation);
router.get("/get-or-create-guest", ChatController.getOrCreateGuestConversation);
router.get("/get-conversation-messages/:id", authUserMiddleWare, ChatController.getConversationMessages);
router.get("/get-admin-conversations", authMiddleWare, ChatController.getAdminConversations);

module.exports = router;
