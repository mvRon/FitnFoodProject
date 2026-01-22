const express = require("express");
const router = express.Router();
const CartController = require("../controllers/CartController")
const { authUserMiddleWare } = require("../middleware/authMiddleware");

router.use(authUserMiddleWare);
router.get('/:userId', CartController.getCart)
router.post('/', CartController.updateCart)
router.delete('/:userId', CartController.deleteCart)

module.exports = router;