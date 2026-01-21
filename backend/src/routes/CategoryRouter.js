const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/CategoryController");
const { authMiddleWare } = require("../middleware/authMiddleware");



router.post("/create-category", authMiddleWare, CategoryController.createCategory);
router.get("/get-all-categories", CategoryController.getAllCategories);
router.get("/get-details-category/:id", CategoryController.getCategoryById);
router.put("/update-category/:id", authMiddleWare, CategoryController.updateCategory);
router.delete("/delete-category/:id", authMiddleWare, CategoryController.deleteCategory);



module.exports = router; 