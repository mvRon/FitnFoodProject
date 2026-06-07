const Order = require("../models/OrderModel");
const InventoryThreshold = require("../models/InventoryThresholdModel");

const getRevenueStats = async (dateFilter) => {
    try {
        // ─────────────────────────────────────────
        // 1. Thống kê đơn hàng cốt lõi
        // ─────────────────────────────────────────
        const orderStatsArr = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    actualRevenue: {
                        $sum: { $cond: [{ $eq: ["$isPaid", true] }, "$totalPrice", 0] }
                    },
                    shippingRevenue: {
                        $sum: { $cond: [{ $eq: ["$isPaid", true] }, { $ifNull: ["$shippingPrice", 0] }, 0] }
                    },
                    expectedRevenue: { $sum: "$totalPrice" },
                    paidOrders: {
                        $sum: { $cond: [{ $eq: ["$isPaid", true] }, 1, 0] }
                    },
                    unpaidOrders: {
                        $sum: { $cond: [{ $eq: ["$isPaid", false] }, 1, 0] }
                    },
                }
            }
        ]);

        const orderStats = orderStatsArr[0] || null;
        const totalOrders = orderStats?.totalOrders || 0;
        const actualRevenue = orderStats?.actualRevenue || 0;
        const shippingRevenue = orderStats?.shippingRevenue || 0;
        const netProductRevenue = Math.max(0, actualRevenue - shippingRevenue);
        const expectedRevenue = orderStats?.expectedRevenue || 0;
        const paidOrders = orderStats?.paidOrders || 0;
        const unpaidRate = totalOrders > 0
            ? Number(((orderStats?.unpaidOrders || 0) / totalOrders * 100).toFixed(1))
            : 0;

        // ─────────────────────────────────────────
        // Helpers cho Phân bổ trọng số (Weighted Allocation)
        // ─────────────────────────────────────────
        const addTotalItemRawValueStage = {
            $addFields: {
                totalItemRawValue: {
                    $sum: {
                        $map: {
                            input: "$orderItems",
                            as: "item",
                            in: {
                                $multiply: [
                                    "$$item.price",
                                    "$$item.amount",
                                    { $subtract: [1, { $divide: [{ $ifNull: ["$$item.discount", 0] }, 100] }] }
                                ]
                            }
                        }
                    }
                }
            }
        };

        const weightedRevenueFormula = {
            $let: {
                vars: {
                    itemRawValue: {
                        $multiply: [
                            "$orderItems.price",
                            "$orderItems.amount",
                            { $subtract: [1, { $divide: [{ $ifNull: ["$orderItems.discount", 0] }, 100] }] }
                        ]
                    },
                    netOrderRevenue: {
                        $max: [0, { $subtract: ["$totalPrice", { $ifNull: ["$shippingPrice", 0] }] }]
                    }
                },
                in: {
                    $cond: [
                        { $gt: ["$totalItemRawValue", 0] },
                        {
                            $multiply: [
                                { $divide: ["$$itemRawValue", "$totalItemRawValue"] },
                                "$$netOrderRevenue"
                            ]
                        },
                        0
                    ]
                }
            }
        };

        // ─────────────────────────────────────────
        // 2. Chỉ số AI per-item
        // ─────────────────────────────────────────
        const aiItemStats = await Order.aggregate([
            { $match: { ...dateFilter, isPaid: true } },
            addTotalItemRawValueStage,
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.orderSource",
                    itemRevenue: { $sum: weightedRevenueFormula },
                    itemCount: { $sum: "$orderItems.amount" },
                    orderCount: { $sum: 1 },
                }
            }
        ]);

        const aiGroups = { organic: {}, chatbot: {}, rag_recommendation: {} };
        aiItemStats.forEach(g => {
            const key = g._id || "organic";
            aiGroups[key] = {
                itemRevenue: g.itemRevenue || 0,
                itemCount: g.itemCount || 0,
                orderCount: g.orderCount || 0,
            };
        });

        const organicRevenue = aiGroups.organic?.itemRevenue || 0;
        const chatbotRevenue = aiGroups.chatbot?.itemRevenue || 0;
        const ragRevenue = aiGroups.rag_recommendation?.itemRevenue || 0;
        const aiRevenue = chatbotRevenue + ragRevenue;
        const aiRevenuePercent = netProductRevenue > 0
            ? Number((aiRevenue / netProductRevenue * 100).toFixed(1))
            : 0;

        const organicOrderCount = aiGroups.organic?.orderCount || 0;
        const chatbotOrderCount = aiGroups.chatbot?.orderCount || 0;
        const ragOrderCount = aiGroups.rag_recommendation?.orderCount || 0;
        const aiOrderCount = chatbotOrderCount + ragOrderCount;

        // ─────────────────────────────────────────
        // 3 & 4. Top sản phẩm theo Phân bổ trọng số
        // ─────────────────────────────────────────
        const buildTopProductsPipeline = (sortField) => [
            { $match: { ...dateFilter, isPaid: true } },
            addTotalItemRawValueStage,
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    productName: { $first: "$orderItems.name" },
                    totalQty: { $sum: "$orderItems.amount" },
                    totalRevenue: { $sum: weightedRevenueFormula },
                }
            },
            { $sort: { [sortField]: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDoc"
                }
            },
            {
                $project: {
                    productId: "$_id",
                    productName: 1,
                    totalQty: 1,
                    totalRevenue: 1,
                    countInStock: { $arrayElemAt: ["$productDoc.countInStock", 0] },
                    image: {
                        $let: {
                            vars: { doc: { $arrayElemAt: ["$productDoc", 0] } },
                            in: { $arrayElemAt: ["$$doc.images", 0] }
                        }
                    },
                }
            }
        ];

        const [topProductsByQty, topProductsByRevenue] = await Promise.all([
            Order.aggregate(buildTopProductsPipeline("totalQty")),
            Order.aggregate(buildTopProductsPipeline("totalRevenue")),
        ]);

        // ─────────────────────────────────────────
        // 5. Cảnh báo tồn kho dưới ngưỡng an toàn
        // ─────────────────────────────────────────
        const thresholds = await InventoryThreshold.find({})
            .populate("product", "name countInStock images sold")
            .lean();

        const lowStockWarnings = thresholds
            .filter(t => t.product && (t.product.countInStock || 0) <= t.safeStockLevel)
            .map(t => ({
                productId: t.product._id,
                productName: t.product.name,
                countInStock: t.product.countInStock || 0,
                safeStockLevel: t.safeStockLevel,
                sold: t.product.sold || 0,
                image: (t.product.images || [])[0] || "",
                severity: (t.product.countInStock || 0) === 0 ? "critical" : "warning",
            }))
            .sort((a, b) => a.countInStock - b.countInStock);

        return {
            status: "OK",
            data: {
                actualRevenue,
                shippingRevenue,
                netProductRevenue,
                expectedRevenue,
                totalOrders,
                paidOrders,
                unpaidRate,

                aiRevenue,
                aiOrderCount,
                aiRevenuePercent,
                organicRevenue,
                organicOrderCount,
                chatbotRevenue,
                chatbotOrderCount,
                ragRevenue,
                ragOrderCount,

                topProductsByQty,
                topProductsByRevenue,
                lowStockWarnings,
            }
        };

    } catch (e) {
        throw e;
    }
};

module.exports = {
    getRevenueStats
};
