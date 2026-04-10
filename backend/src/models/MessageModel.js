const mongoose = require("mongoose");

const productSnapshotSchema = new mongoose.Schema(
    {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String },
        price: { type: Number },
        images: [{ type: String }],
        discount: { type: Number },
    },
    { _id: false }
);

const messageSchema = new mongoose.Schema(
    {
        conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
        sender: { type: String, enum: ["user", "bot", "admin"], required: true },
        content: { type: String, default: "" },
        metadata: {
            productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
            products: [productSnapshotSchema],
        },
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
