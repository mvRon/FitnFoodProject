const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/PaymentController");
const { authUserMiddleWare } = require("../middleware/authMiddleware");

// Tạo payment link PayOS (cần đăng nhập)
router.post("/create-payment-link", authUserMiddleWare, PaymentController.createPaymentLink);

// Webhook nhận callback từ PayOS (KHÔNG cần auth — PayOS gọi trực tiếp)
router.post("/webhook", PaymentController.handleWebhook);

// Kiểm tra trạng thái thanh toán (cần đăng nhập)
router.get("/status/:orderCode", authUserMiddleWare, PaymentController.getPaymentStatus);

// Hủy payment link (frontend gọi khi timeout, cần đăng nhập)
router.post("/cancel", authUserMiddleWare, PaymentController.cancelPayment);

module.exports = router;
