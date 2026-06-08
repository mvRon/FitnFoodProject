const express = require("express");
const router = express.Router();
const RevenueController = require("../controllers/RevenueController");
const { authMiddleWare } = require("../middleware/authMiddleware");

// Thống kê doanh thu & AI analytics — chỉ admin
router.get("/stats", authMiddleWare, RevenueController.getRevenueStats);

module.exports = router;
