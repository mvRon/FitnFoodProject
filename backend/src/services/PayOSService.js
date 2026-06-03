const { PayOS } = require("@payos/node");

// Khởi tạo PayOS client từ cấu hình hoặc các biến môi trường
const payosClient = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID || process.env.CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY || process.env.API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY || process.env.CHECKSUM_KEY
});

/**
 * Tạo payment link PayOS từ thông tin đơn hàng
 * @param {Object} params
 * @param {string|number} params.orderCode - Mã đơn hàng (số nguyên < 9007199254740991)
 * @param {number} params.amount - Tổng tiền (VND, số nguyên)
 * @param {string} params.description - Mô tả đơn hàng (tối đa 25 ký tự)
 * @param {Array} params.items - Danh sách sản phẩm [{name, quantity, price}]
 * @param {string} params.returnUrl - URL redirect khi thanh toán thành công
 * @param {string} params.cancelUrl - URL redirect khi hủy thanh toán
 * @param {string} [params.buyerName] - Tên người mua (tùy chọn)
 * @param {string} [params.buyerPhone] - SĐT người mua (tùy chọn)
 * @param {string} [params.buyerEmail] - Email người mua (tùy chọn)
 * @returns {Promise<{checkoutUrl: string, qrCode: string, paymentLinkId: string}>}
 */
const createPaymentLink = async ({
    orderCode,
    amount,
    description,
    items,
    returnUrl,
    cancelUrl,
    buyerName,
    buyerPhone,
    buyerEmail,
}) => {
    const paymentData = {
        orderCode: Number(orderCode),
        amount: Math.round(amount), // PayOS yêu cầu số nguyên VND
        description: String(description || "FitnFood Order").slice(0, 25),
        items: (items || []).map((item) => ({
            name: String(item.name || "").slice(0, 50),
            quantity: Number(item.quantity || 1),
            price: Math.round(Number(item.price || 0)),
        })),
        returnUrl: returnUrl || `${process.env.FRONTEND_URL || "http://localhost:3000"}/orderSuccess`,
        cancelUrl: cancelUrl || `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment`,
    };

    // Thêm thông tin người mua nếu có (không bắt buộc)
    if (buyerName) paymentData.buyerName = buyerName;
    if (buyerPhone) paymentData.buyerPhone = buyerPhone;
    if (buyerEmail) paymentData.buyerEmail = buyerEmail;

    // SDK v2 dùng payosClient.paymentRequests.create()
    const response = await payosClient.paymentRequests.create(paymentData);

    return {
        checkoutUrl: response.checkoutUrl,
        qrCode: response.qrCode,
        paymentLinkId: response.paymentLinkId,
        orderCode: response.orderCode,
        bin: response.bin,
        accountNumber: response.accountNumber,
        accountName: response.accountName,
        amount: response.amount,
        description: response.description,
    };
};

/**
 * Xác thực dữ liệu webhook từ PayOS (kiểm tra HMAC signature)
 * @param {Object} webhookData - Raw body từ PayOS webhook request
 * @returns {Object} - Dữ liệu đã được xác thực
 * @throws {Error} - Nếu signature không hợp lệ
 */
const verifyWebhookData = (webhookData) => {
    // SDK v2 dùng payosClient.webhooks.verify()
    return payosClient.webhooks.verify(webhookData);
};

/**
 * Lấy thông tin trạng thái thanh toán từ PayOS API
 * @param {string|number} orderCode - Mã đơn hàng
 * @returns {Promise<Object>} - Thông tin payment link từ PayOS
 */
const getPaymentInfo = async (orderCode) => {
    // SDK v2 dùng payosClient.paymentRequests.get()
    return await payosClient.paymentRequests.get(orderCode);
};

/**
 * Hủy payment link trên PayOS (gọi khi đơn hết hạn phía backend)
 * @param {string|number} orderCode - Mã đơn hàng
 * @param {string} [reason] - Lý do hủy
 */
const cancelPaymentLink = async (orderCode, reason = "Order expired") => {
    try {
        // SDK v2 dùng payosClient.paymentRequests.cancel()
        return await payosClient.paymentRequests.cancel(orderCode, reason);
    } catch (err) {
        console.warn(`[PayOS] cancelPaymentLink failed for ${orderCode}:`, err?.message);
        return null;
    }
};

/**
 * Tạo orderCode ngắn (số nguyên) từ MongoDB ObjectId
 * PayOS yêu cầu orderCode là số nguyên < 9007199254740991
 * Dùng 8 ký tự hex cuối của ObjectId → convert sang số nguyên 32-bit
 */
const generateOrderCode = (mongoId) => {
    const hex = String(mongoId).slice(-8);
    const num = parseInt(hex, 16);
    // Đảm bảo dương và < 2^31 để tránh overflow
    return Math.abs(num % 2000000000) + 1;
};

module.exports = {
    createPaymentLink,
    verifyWebhookData,
    getPaymentInfo,
    cancelPaymentLink,
    generateOrderCode,
};
