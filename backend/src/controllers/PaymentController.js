const OrderService = require("../services/OrderService");
const PayOSService = require("../services/PayOSService");
const Order = require("../models/OrderModel");

// Sẽ được gán bởi index.js sau khi khởi tạo Socket.IO
let _io = null;
const setIo = (io) => { _io = io; };

// =============================================
// Tạo payment link PayOS
// POST /api/payment/create-payment-link
// =============================================
const createPaymentLink = async (req, res) => {
    try {
        const {
            orderItems,
            itemsPrice,
            shippingPrice,
            totalPrice,
            fullName,
            address,
            city,
            phone,
        } = req.body;

        const userId = req.user.id;

        // Validate required fields
        if (!orderItems?.length || !fullName?.trim() || !address?.trim() || !city?.trim() || !phone?.trim()) {
            return res.status(200).json({ status: "ERR", message: "Vui lòng điền đầy đủ thông tin đặt hàng!" });
        }

        // Bước 1: Tạo đơn hàng pending trước (iPaid=false, trừ kho)
        const pendingOrderResult = await OrderService.createPendingOrder({
            orderItems,
            paymentMethod: "payos",
            itemsPrice,
            shippingPrice,
            totalPrice,
            fullName,
            address,
            city,
            phone,
            user: userId,
            email: req.body.email || "",
        });

        if (pendingOrderResult.status === "ERR") {
            return res.status(200).json(pendingOrderResult);
        }

        const order = pendingOrderResult.data;

        // Bước 2: Tạo payosOrderCode từ MongoDB _id
        const payosOrderCode = PayOSService.generateOrderCode(order._id);

        // Bước 3: Tạo payment link PayOS
        const ngrokUrl = process.env.NGROK_URL || "";
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

        const paymentLinkData = await PayOSService.createPaymentLink({
            orderCode: payosOrderCode,
            amount: Math.round(totalPrice),
            description: `FitnFood #${String(order._id).slice(-6).toUpperCase()}`,
            items: orderItems.map((item) => ({
                name: String(item.name || "Sản phẩm").slice(0, 50),
                quantity: Number(item.amount || 1),
                price: Math.round(Number(item.price || 0)),
            })),
            returnUrl: `${frontendUrl}/orderSuccess`,
            cancelUrl: `${frontendUrl}/payment`,
            buyerName: fullName,
            buyerPhone: phone,
        });

        // Bước 4: Cập nhật payosOrderCode và paymentLinkId vào DB
        await Order.findByIdAndUpdate(order._id, {
            payosOrderCode,
            paymentLinkId: paymentLinkData.paymentLinkId,
        });

        return res.status(200).json({
            status: "OK",
            message: "Payment link created!",
            data: {
                orderId: order._id,
                payosOrderCode,
                qrCode: paymentLinkData.qrCode,
                checkoutUrl: paymentLinkData.checkoutUrl,
                paymentLinkId: paymentLinkData.paymentLinkId,
                totalPrice,
            },
        });

    } catch (e) {
        console.error("[PaymentController] createPaymentLink error:", e);
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Không thể tạo link thanh toán. Vui lòng thử lại.",
        });
    }
};

// =============================================
// Webhook nhận callback từ PayOS
// POST /api/payment/webhook
// (Không cần auth — PayOS gọi trực tiếp)
// =============================================
const handleWebhook = async (req, res) => {
    try {
        const webhookData = req.body;

        // Xác thực chữ ký HMAC từ PayOS
        let verifiedData;
        try {
            verifiedData = PayOSService.verifyWebhookData(webhookData);
        } catch (verifyErr) {
            console.warn("[PayOS Webhook] Invalid signature:", verifyErr?.message);
            return res.status(200).json({ error: "0" }); // PayOS yêu cầu response 200 dù lỗi
        }

        const { orderCode, code, desc } = verifiedData;
        console.log(`[PayOS Webhook] orderCode=${orderCode} code=${code} desc=${desc}`);

        // Tìm đơn hàng theo payosOrderCode
        const order = await Order.findOne({ payosOrderCode: Number(orderCode) });
        if (!order) {
            console.warn(`[PayOS Webhook] Order not found for orderCode: ${orderCode}`);
            return res.status(200).json({ error: "0" });
        }

        const orderId = order._id.toString();

        if (code === "00") {
            // Thanh toán thành công — cập nhật đơn hàng
            await Order.findByIdAndUpdate(order._id, {
                isPaid: true,
                paidAt: new Date(),
            });

            console.log(`[PayOS] Order ${orderId} marked as PAID`);

            // Emit Socket.IO real-time xuống frontend
            if (_io) {
                _io.to(`payment:${orderId}`).emit("payment:success", {
                    orderId,
                    totalPrice: order.totalPrice,
                    paidAt: new Date(),
                });
            }

        } else {
            // Thanh toán thất bại / hủy — hủy đơn + hoàn kho
            console.log(`[PayOS] Order ${orderId} cancelled (code=${code})`);

            try {
                await OrderService.cancelExpiredOrder(orderId);
            } catch (cancelErr) {
                console.error("[PayOS] cancelExpiredOrder failed:", cancelErr?.message);
            }

            if (_io) {
                _io.to(`payment:${orderId}`).emit("payment:cancelled", {
                    orderId,
                    reason: desc || "Payment cancelled",
                });
            }
        }

        // PayOS yêu cầu trả về { error: "0" } để xác nhận đã nhận webhook
        return res.status(200).json({ error: "0" });

    } catch (e) {
        console.error("[PaymentController] handleWebhook error:", e);
        return res.status(200).json({ error: "0" }); // Luôn trả 200 cho PayOS
    }
};

// =============================================
// Kiểm tra trạng thái thanh toán
// GET /api/payment/status/:orderCode
// =============================================
const getPaymentStatus = async (req, res) => {
    try {
        const { orderCode } = req.params;
        const info = await PayOSService.getPaymentInfo(orderCode);
        return res.status(200).json({ status: "OK", data: info });
    } catch (e) {
        return res.status(500).json({ status: "ERR", message: e.message });
    }
};

// =============================================
// Hủy payment link (frontend gọi khi timeout)
// POST /api/payment/cancel
// =============================================
const cancelPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user?.id;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(200).json({ status: "ERR", message: "Order not found!" });
        }

        // Chỉ chủ đơn hàng mới được hủy
        if (order.user.toString() !== String(userId)) {
            return res.status(403).json({ status: "ERR", message: "Unauthorized!" });
        }

        if (order.isPaid) {
            return res.status(200).json({ status: "ERR", message: "Order already paid!" });
        }

        // Hủy link PayOS trên server PayOS
        if (order.payosOrderCode) {
            await PayOSService.cancelPaymentLink(order.payosOrderCode, "Người dùng hủy");
        }

        // Hủy đơn hàng local + hoàn kho
        await OrderService.cancelExpiredOrder(orderId);

        return res.status(200).json({ status: "OK", message: "Payment cancelled!" });

    } catch (e) {
        console.error("[PaymentController] cancelPayment error:", e);
        return res.status(500).json({ status: "ERR", message: e.message });
    }
};

module.exports = {
    createPaymentLink,
    handleWebhook,
    getPaymentStatus,
    cancelPayment,
    setIo,
};
