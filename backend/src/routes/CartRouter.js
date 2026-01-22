const express = require("express");
const router = express.Router();
const CartController = require("../controllers/CartController")

router.get('/:userId', CartController.getCart)
router.post('/', CartController.updateCart)
router.delete('/:userId', CartController.deleteCart)

module.exports = router;