const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/OrderController")
const { authMiddleWare, authUserMiddleWare } = require("../middleware/authMiddleware");


// Người dùng tạo đơn hàng
router.post("/", authUserMiddleWare, OrderController.createOrder);

// Người dùng lấy toàn bộ đơn hàng của họ
router.get("/", authUserMiddleWare, OrderController.getUserOrders);

// Người dùng lấy chi tiết đơn hàng theo ID
router.get("/:id", authUserMiddleWare, OrderController.getOrderById);

// Người dùng xóa đơn hàng
router.delete("/:id", authUserMiddleWare, OrderController.deleteOrder);

router.put("/:id", authUserMiddleWare, OrderController.updateOrder);

// Admin lấy toàn bộ danh sách đơn hàng
router.get("/admin/all", authMiddleWare, OrderController.getAllOrders);


module.exports = router;