const mongoose = require('mongoose')

const discountSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true }, 
        code: { type: String, required: true, unique: true, uppercase: true }, 
        type: { type: String, required: true, enum: ['percent', 'fixed'] }, 
        value: { type: Number, required: true }, 
        minValue: { type: Number, default: 0 }, 
        maxUses: { type: Number, default: 1 }, 
        usesLeft: { type: Number, default: 1 }, 
        startDate: { type: Date, required: true }, 
        endDate: { type: Date, required: true }, 
        usersUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
        isActive: { type: Boolean, default: true }, 
    },
    {
        timestamps: true,
    }
);

const Discount = mongoose.model("Discount", discountSchema);
module.exports = Discount;