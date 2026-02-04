const DiscountService = require("../services/DiscountService");

const createDiscount = async (req, res) => {
	try {
		const { name, code, type, value, minValue, maxUses, usesLeft, startDate, endDate, isActive } = req.body;

		if (!name || !code || !type || value == null || !startDate || !endDate) {
			return res.status(400).json({
				status: "ERR",
				message: "All required fields must be provided!",
				data: null
			});
		}

		const result = await DiscountService.createDiscount({
			name,
			code,
			type,
			value,
			minValue,
			maxUses,
			usesLeft,
			startDate,
			endDate,
			isActive
		});

		return res.status(result.status === "OK" ? 201 : 400).json(result);
	} catch (error) {
		return res.status(500).json({
			status: "ERR",
			message: error.message,
			data: null
		});
	}
};

const updateDiscount = async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({
				status: "ERR",
				message: "Discount ID is required!",
				data: null
			});
		}

		const result = await DiscountService.updateDiscount(id, req.body);
		return res.status(result.status === "OK" ? 200 : 400).json(result);
	} catch (error) {
		return res.status(500).json({
			status: "ERR",
			message: error.message,
			data: null
		});
	}
};

const deleteDiscount = async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({
				status: "ERR",
				message: "Discount ID is required!",
				data: null
			});
		}

		const result = await DiscountService.deleteDiscount(id);
		return res.status(result.status === "OK" ? 200 : 400).json(result);
	} catch (error) {
		return res.status(500).json({
			status: "ERR",
			message: error.message,
			data: null
		});
	}
};

const getAllDiscounts = async (req, res) => {
	try {
		const result = await DiscountService.getAllDiscounts(req.query);
		return res.status(result.status === "OK" ? 200 : 400).json(result);
	} catch (error) {
		return res.status(500).json({
			status: "ERR",
			message: error.message,
			data: null
		});
	}
};

const getDiscountById = async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({
				status: "ERR",
				message: "Discount ID is required!",
				data: null
			});
		}

		const result = await DiscountService.getDiscountById(id);
		return res.status(result.status === "OK" ? 200 : 404).json(result);
	} catch (error) {
		return res.status(500).json({
			status: "ERR",
			message: error.message,
			data: null
		});
	}
};

const useDiscount = async (req, res) => {
	try {
		const { code, orderValue } = req.body;
		const userId = req.user?.id;

		if (!code || orderValue == null) {
			return res.status(400).json({
				status: "ERR",
				message: "Discount code and order value are required!",
				data: null
			});
		}
		if (!userId) {
			return res.status(401).json({
				status: "ERR",
				message: "User not authenticated!",
				data: null
			});
		}

		const result = await DiscountService.useDiscount({
			code,
			orderValue,
			userId
		});

		return res.status(result.status === "OK" ? 200 : 400).json(result);
	} catch (error) {
		return res.status(500).json({
			status: "ERR",
			message: error.message,
			data: null
		});
	}
};

module.exports = {
	createDiscount,
	updateDiscount,
	deleteDiscount,
	getAllDiscounts,
	getDiscountById,
	useDiscount
};
