const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/OrderController")
const { authMiddleWare, authUserMiddleWare } = require("../middleware/authMiddleware");


router.post("/", authUserMiddleWare, OrderController.createOrder);


module.exports = router;