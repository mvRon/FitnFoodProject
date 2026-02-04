const Discount = require("../models/DiscountModel");

const normalizeCode = (code) => code?.toString().trim().toUpperCase();

const createDiscount = async (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			const normalizedCode = normalizeCode(data.code);
			const name = data.name?.trim();

			if (!name || !normalizedCode) {
				return resolve({
					status: "ERR",
					message: "Name and code are required!",
					data: null
				});
			}

			if (!data.type || !["percent", "fixed"].includes(data.type)) {
				return resolve({
					status: "ERR",
					message: "Invalid discount type!",
					data: null
				});
			}

			if (data.value == null || Number(data.value) <= 0) {
				return resolve({
					status: "ERR",
					message: "Discount value must be greater than 0!",
					data: null
				});
			}

			if (data.type === "percent" && Number(data.value) > 100) {
				return resolve({
					status: "ERR",
					message: "Percent discount cannot exceed 100%!",
					data: null
				});
			}

			const startDate = new Date(data.startDate);
			const endDate = new Date(data.endDate);
			if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
				return resolve({
					status: "ERR",
					message: "Invalid start or end date!",
					data: null
				});
			}
			if (startDate > endDate) {
				return resolve({
					status: "ERR",
					message: "Start date must be before end date!",
					data: null
				});
			}

			const existing = await Discount.findOne({
				$or: [{ name }, { code: normalizedCode }]
			});
			if (existing) {
				return resolve({
					status: "ERR",
					message: "Discount name or code already exists!",
					data: null
				});
			}

			const maxUses = data.maxUses != null ? Number(data.maxUses) : 1;
			if (Number.isNaN(maxUses) || maxUses <= 0) {
				return resolve({
					status: "ERR",
					message: "maxUses must be greater than 0!",
					data: null
				});
			}

			let usesLeft = data.usesLeft != null ? Number(data.usesLeft) : maxUses;
			if (Number.isNaN(usesLeft) || usesLeft < 0) {
				return resolve({
					status: "ERR",
					message: "usesLeft must be 0 or greater!",
					data: null
				});
			}
			if (usesLeft > maxUses) {
				usesLeft = maxUses;
			}

			const minValue = data.minValue != null ? Number(data.minValue) : 0;
			if (Number.isNaN(minValue) || minValue < 0) {
				return resolve({
					status: "ERR",
					message: "minValue must be 0 or greater!",
					data: null
				});
			}

			const newDiscount = await Discount.create({
				name,
				code: normalizedCode,
				type: data.type,
				value: Number(data.value),
				minValue,
				maxUses,
				usesLeft,
				startDate,
				endDate,
				isActive: data.isActive ?? true
			});

			return resolve({
				status: "OK",
				message: "Discount created successfully!",
				data: newDiscount
			});
		} catch (error) {
			return reject(error);
		}
	});
};

const updateDiscount = async (id, data) => {
	return new Promise(async (resolve, reject) => {
		try {
			const existing = await Discount.findById(id);
			if (!existing) {
				return resolve({
					status: "ERR",
					message: "Discount not found!",
					data: null
				});
			}

			const updateData = { ...data };

			if (data.name) {
				updateData.name = data.name.trim();
			}
			if (data.code) {
				updateData.code = normalizeCode(data.code);
			}

			if (data.type && !["percent", "fixed"].includes(data.type)) {
				return resolve({
					status: "ERR",
					message: "Invalid discount type!",
					data: null
				});
			}

			if (data.value != null && Number(data.value) <= 0) {
				return resolve({
					status: "ERR",
					message: "Discount value must be greater than 0!",
					data: null
				});
			}

			if (data.type === "percent" && data.value != null && Number(data.value) > 100) {
				return resolve({
					status: "ERR",
					message: "Percent discount cannot exceed 100%!",
					data: null
				});
			}

			const checkName = updateData.name || updateData.code;
			if (checkName) {
				const duplicate = await Discount.findOne({
					_id: { $ne: id },
					$or: [
						updateData.name ? { name: updateData.name } : null,
						updateData.code ? { code: updateData.code } : null
					].filter(Boolean)
				});
				if (duplicate) {
					return resolve({
						status: "ERR",
						message: "Discount name or code already exists!",
						data: null
					});
				}
			}

			if (data.startDate || data.endDate) {
				const startDate = data.startDate ? new Date(data.startDate) : existing.startDate;
				const endDate = data.endDate ? new Date(data.endDate) : existing.endDate;

				if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
					return resolve({
						status: "ERR",
						message: "Invalid start or end date!",
						data: null
					});
				}
				if (startDate > endDate) {
					return resolve({
						status: "ERR",
						message: "Start date must be before end date!",
						data: null
					});
				}
				updateData.startDate = startDate;
				updateData.endDate = endDate;
			}

			if (data.minValue != null) {
				const minValue = Number(data.minValue);
				if (Number.isNaN(minValue) || minValue < 0) {
					return resolve({
						status: "ERR",
						message: "minValue must be 0 or greater!",
						data: null
					});
				}
				updateData.minValue = minValue;
			}

			const usedCount = existing.maxUses - existing.usesLeft;
			const newMaxUses = data.maxUses != null ? Number(data.maxUses) : existing.maxUses;

			if (data.maxUses != null) {
				if (Number.isNaN(newMaxUses) || newMaxUses <= 0) {
					return resolve({
						status: "ERR",
						message: "maxUses must be greater than 0!",
						data: null
					});
				}
				if (usedCount > newMaxUses) {
					return resolve({
						status: "ERR",
						message: "maxUses cannot be less than used count!",
						data: null
					});
				}
				updateData.maxUses = newMaxUses;
			}

			if (data.usesLeft != null) {
				let usesLeft = Number(data.usesLeft);
				if (Number.isNaN(usesLeft) || usesLeft < 0) {
					return resolve({
						status: "ERR",
						message: "usesLeft must be 0 or greater!",
						data: null
					});
				}
				if (usesLeft > newMaxUses) {
					usesLeft = newMaxUses;
				}
				updateData.usesLeft = usesLeft;
			} else if (data.maxUses != null) {
				updateData.usesLeft = Math.max(newMaxUses - usedCount, 0);
			}

			const updatedDiscount = await Discount.findByIdAndUpdate(id, updateData, { new: true });

			return resolve({
				status: "OK",
				message: "Discount updated successfully!",
				data: updatedDiscount
			});
		} catch (error) {
			return reject(error);
		}
	});
};

const deleteDiscount = async (id) => {
	return new Promise(async (resolve, reject) => {
		try {
			const deleted = await Discount.findByIdAndDelete(id);
			if (!deleted) {
				return resolve({
					status: "ERR",
					message: "Discount not found!",
					data: null
				});
			}
			return resolve({
				status: "OK",
				message: "Discount deleted successfully!",
				data: deleted
			});
		} catch (error) {
			return reject(error);
		}
	});
};

const getAllDiscounts = async (query = {}) => {
	return new Promise(async (resolve, reject) => {
		try {
			const {
				page = 1,
				limit = 20,
				search,
				type,
				isActive,
				code,
				name,
				sortBy = "createdAt",
				sortOrder = "desc"
			} = query;

			const filter = {};

			if (type) {
				filter.type = type;
			}
			if (isActive != null) {
				filter.isActive = isActive === "true" || isActive === true;
			}
			if (code) {
				filter.code = normalizeCode(code);
			}
			if (name) {
				filter.name = { $regex: name, $options: "i" };
			}
			if (search) {
				filter.$or = [
					{ name: { $regex: search, $options: "i" } },
					{ code: { $regex: search, $options: "i" } }
				];
			}

			const pageNumber = Math.max(Number(page) || 1, 1);
			const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);
			const skip = (pageNumber - 1) * limitNumber;
			const sortValue = sortOrder === "asc" ? 1 : -1;

			const [discounts, total] = await Promise.all([
				Discount.find(filter)
					.sort({ [sortBy]: sortValue })
					.skip(skip)
					.limit(limitNumber),
				Discount.countDocuments(filter)
			]);

			return resolve({
				status: "OK",
				message: "Discounts retrieved successfully!",
				data: discounts,
				pagination: {
					page: pageNumber,
					limit: limitNumber,
					total
				}
			});
		} catch (error) {
			return reject(error);
		}
	});
};

const getDiscountById = async (id) => {
	return new Promise(async (resolve, reject) => {
		try {
			const discount = await Discount.findById(id);
			if (!discount) {
				return resolve({
					status: "ERR",
					message: "Discount not found!",
					data: null
				});
			}
			return resolve({
				status: "OK",
				message: "Discount retrieved successfully!",
				data: discount
			});
		} catch (error) {
			return reject(error);
		}
	});
};

const useDiscount = async ({ code, orderValue, userId }) => {
	return new Promise(async (resolve, reject) => {
		try {
			const normalizedCode = normalizeCode(code);
			const numericOrderValue = Number(orderValue);

			if (!normalizedCode) {
				return resolve({
					status: "ERR",
					message: "Discount code is required!",
					data: null
				});
			}
			if (Number.isNaN(numericOrderValue) || numericOrderValue < 0) {
				return resolve({
					status: "ERR",
					message: "Order value must be a valid number!",
					data: null
				});
			}

			const discount = await Discount.findOne({ code: normalizedCode });
			if (!discount) {
				return resolve({
					status: "ERR",
					message: "Discount code not found!",
					data: null
				});
			}

			const now = new Date();
			if (!discount.isActive) {
				return resolve({
					status: "ERR",
					message: "Discount is not active!",
					data: null
				});
			}
			if (discount.startDate && now < discount.startDate) {
				return resolve({
					status: "ERR",
					message: "Discount is not active yet!",
					data: null
				});
			}
			if (discount.endDate && now > discount.endDate) {
				return resolve({
					status: "ERR",
					message: "Discount has expired!",
					data: null
				});
			}
			if (discount.usesLeft <= 0) {
				return resolve({
					status: "ERR",
					message: "Discount usage limit reached!",
					data: null
				});
			}
			if (discount.usersUsed?.some((id) => id.toString() === userId)) {
				return resolve({
					status: "ERR",
					message: "You have already used this discount!",
					data: null
				});
			}
			if (numericOrderValue < discount.minValue) {
				return resolve({
					status: "ERR",
					message: `Order value must be at least ${discount.minValue}!`,
					data: null
				});
			}

			let discountAmount = 0;
			if (discount.type === "percent") {
				discountAmount = (numericOrderValue * discount.value) / 100;
			} else {
				discountAmount = discount.value;
			}
			if (discountAmount > numericOrderValue) {
				discountAmount = numericOrderValue;
			}

			const updatedDiscount = await Discount.findOneAndUpdate(
				{
					_id: discount._id,
					usesLeft: { $gt: 0 },
					usersUsed: { $ne: userId }
				},
				{
					$inc: { usesLeft: -1 },
					$push: { usersUsed: userId }
				},
				{ new: true }
			);

			if (!updatedDiscount) {
				return resolve({
					status: "ERR",
					message: "Failed to apply discount. Please try again!",
					data: null
				});
			}

			return resolve({
				status: "OK",
				message: "Discount applied successfully!",
				data: {
					discount: updatedDiscount,
					discountAmount,
					finalTotal: Math.max(numericOrderValue - discountAmount, 0)
				}
			});
		} catch (error) {
			return reject(error);
		}
	});
};

module.exports = {
	createDiscount,
	updateDiscount,
	deleteDiscount,
	getAllDiscounts,
	getDiscountById,
	useDiscount
};
