const express = require("express");
const router = express.Router();
const InventoryController = require("../controllers/InventoryController");
const { authMiddleWare, authUserMiddleWare } = require("../middleware/authMiddleware");

router.post("/import", authUserMiddleWare, InventoryController.createImportVoucher);
router.post("/export", authUserMiddleWare, InventoryController.createExportVoucher);

router.get("/vouchers", authUserMiddleWare, InventoryController.getAllVouchers);
router.get("/vouchers/:id", authUserMiddleWare, InventoryController.getVoucherDetails);

router.get("/stock-card/:productId", authUserMiddleWare, InventoryController.getStockCardByProduct);

router.put("/threshold/:productId", authMiddleWare, InventoryController.upsertThreshold);

router.get("/alerts", authUserMiddleWare, InventoryController.getInventoryAlerts);
router.post("/alerts/discrepancy", authUserMiddleWare, InventoryController.checkInventoryDiscrepancy);

module.exports = router;
