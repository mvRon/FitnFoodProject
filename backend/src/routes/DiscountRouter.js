const express = require("express");
const DiscountController = require("../controllers/DiscountController");
const router = express.Router();
const { authMiddleWare, authUserMiddleWare } = require("../middleware/authMiddleware.js"); 



router.post("/create-discount", authMiddleWare, DiscountController.createDiscount);
router.put("/update-discount/:id", authMiddleWare, DiscountController.updateDiscount);
router.delete("/delete-discount/:id", authMiddleWare, DiscountController.deleteDiscount);


router.get("/get-all-discounts", DiscountController.getAllDiscounts);
router.get("/get-details-discount/:id", DiscountController.getDiscountById);


router.post("/use-discount", authUserMiddleWare, DiscountController.useDiscount);

module.exports = router;
