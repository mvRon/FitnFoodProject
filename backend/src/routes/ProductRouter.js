const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");
const { authMiddleWare, authUserMiddleWare } = require("../middleware/authMiddleware");

router.post('/createProduct', authMiddleWare, ProductController.createProduct);
router.put('/updateProduct/:id', authMiddleWare, ProductController.updateProduct);
router.delete('/deleteProduct/:id', authMiddleWare, ProductController.deleteProduct);
router.get('/get-details-product/:id', ProductController.getDetailsProduct);
router.get('/get-all-products', ProductController.getAllProducts);



module.exports = router;