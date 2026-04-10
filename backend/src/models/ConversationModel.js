const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        guestId: { type: String, default: null, index: true },
        admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        status: {
            type: String,
            enum: ["bot_active", "waiting_for_admin", "admin_active"],
            default: "bot_active",
        },
        lastMessageAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
