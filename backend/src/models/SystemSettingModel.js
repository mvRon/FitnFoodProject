const mongoose = require('mongoose');

const SystemSettingSchema = new mongoose.Schema(
    {
        // ────────────────────────────────────────────
        //  Thông tin cửa hàng
        // ────────────────────────────────────────────
        storeName: {
            type: String,
            default: 'FitnFood',
        },
        storeLogo: {
            type: String, // base64 hoặc URL ảnh
            default: '',
        },
        storeAddress: {
            type: String,
            default: '',
        },
        storePhone: {
            type: String,
            default: '',
        },
        storeEmail: {
            type: String,
            default: '',
        },
        storeSlogan: {
            type: String,
            default: '',
        },

        // ────────────────────────────────────────────
        //  Thanh toán & Vận chuyển
        // ────────────────────────────────────────────
        shippingFee: {
            type: Number,
            default: 30000, // 30.000 VNĐ
        },
        freeShippingThreshold: {
            type: Number,
            default: 200000, // 200.000 VNĐ
        },
        paymentMethods: {
            cod: { type: Boolean, default: true },
            payos: { type: Boolean, default: true },
        },

        // ────────────────────────────────────────────
        //  Email
        // ────────────────────────────────────────────
        emailSenderName: {
            type: String,
            default: 'FitnFood Corporation',
        },
        autoSendEmail: {
            verifyAccount: { type: Boolean, default: true },
            recoveryPassword: { type: Boolean, default: true },
            sendEmailOrder: { type: Boolean, default: true },
            restockNotification: { type: Boolean, default: true },
        },

        // ────────────────────────────────────────────
        //  SEO
        // ────────────────────────────────────────────
        metaTitle: {
            type: String,
            default: 'FITNFOOD',
        },
        metaDescription: {
            type: String,
            default: 'FitnFood cung cấp các sản phẩm thực phẩm lành mạnh, giàu dinh dưỡng, phù hợp với lối sống năng động và khoa học.',
        },
    },
    { timestamps: true }
);

const SystemSettingModel = mongoose.model('SystemSetting', SystemSettingSchema);

module.exports = SystemSettingModel;
