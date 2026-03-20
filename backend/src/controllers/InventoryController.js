const InventoryService = require("../services/InventoryService");

const createImportVoucher = async (req, res) => {
    try {
        const { sourceType, items } = req.body;

        if (!sourceType || !Array.isArray(items) || items.length === 0) {
            return res.status(200).json({
                status: "ERR",
                message: "sourceType va items la bat buoc",
            });
        }

        const userId = req.user.id;
        const response = await InventoryService.createImportVoucher(req.body, userId);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Something went wrong!",
        });
    }
};

const createExportVoucher = async (req, res) => {
    try {
        const { exportReason, items } = req.body;

        if (!exportReason || !Array.isArray(items) || items.length === 0) {
            return res.status(200).json({
                status: "ERR",
                message: "exportReason and items are required!",
            });
        }

        const userId = req.user.id;
        const response = await InventoryService.createExportVoucher(req.body, userId);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Something went wrong!",
        });
    }
};

const getStockCardByProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const { fromDate, toDate } = req.query;

        if (!productId) {
            return res.status(200).json({
                status: "ERR",
                message: "productId is required!",
            });
        }

        const response = await InventoryService.getStockCardByProduct(productId, fromDate, toDate);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Something went wrong!",
        });
    }
};

const upsertThreshold = async (req, res) => {
    try {
        const productId = req.params.productId;

        if (!productId) {
            return res.status(200).json({
                status: "ERR",
                message: "productId is required!",
            });
        }

        const response = await InventoryService.upsertThreshold(productId, req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Something went wrong!",
        });
    }
};

const getInventoryAlerts = async (req, res) => {
    try {
        const response = await InventoryService.getInventoryAlerts();
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Something went wrong!",
        });
    }
};

const checkInventoryDiscrepancy = async (req, res) => {
    try {
        const { actualCounts = [] } = req.body;
        const response = await InventoryService.getInventoryAlerts(actualCounts);

        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Something went wrong!",
        });
    }
};

const getAllVouchers = async (req, res) => {
    try {
        const response = await InventoryService.getAllVouchers(req.query);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Something went wrong!",
        });
    }
};

const getVoucherDetails = async (req, res) => {
    try {
        const voucherId = req.params.id;

        if (!voucherId) {
            return res.status(200).json({
                status: "ERR",
                message: "voucherId is required!",
            });
        }

        const response = await InventoryService.getVoucherDetails(voucherId);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Something went wrong!",
        });
    }
};

module.exports = {
    createImportVoucher,
    createExportVoucher,
    getStockCardByProduct,
    upsertThreshold,
    getInventoryAlerts,
    checkInventoryDiscrepancy,
    getAllVouchers,
    getVoucherDetails,
};
