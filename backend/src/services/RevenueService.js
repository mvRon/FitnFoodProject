const Order = require("../models/OrderModel");
const InventoryThreshold = require("../models/InventoryThresholdModel");

// Simple In-Memory Cache để cải thiện tốc độ API
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // Cache tồn tại 1 phút

const getRevenueStats = async (dateFilter) => {
    try {
        // Tạo Cache Key dựa trên điều kiện lọc
        const cacheKey = JSON.stringify(dateFilter);
        const cachedItem = cache.get(cacheKey);

        if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_TTL_MS)) {
            console.log("[RevenueService] Trả về dữ liệu từ Cache RAM");
            return {
                status: "OK",
                data: cachedItem.data
            };
        }

        // ─────────────────────────────────────────
        // Khai báo các Pipeline dùng chung
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
                }
            }
        ];

        // ─────────────────────────────────────────
        // Chạy TẤT CẢ các truy vấn song song (Promise.all)
        // ─────────────────────────────────────────
        console.log("[RevenueService] Đang tính toán dữ liệu mới từ Database...");
        const [
            orderStatsArr,
            aiItemStats,
            topProductsByQty,
            topProductsByRevenue,
            thresholds
        ] = await Promise.all([
            // 1. Thống kê đơn hàng cốt lõi
            Order.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        actualRevenue: { $sum: { $cond: [{ $eq: ["$isPaid", true] }, "$totalPrice", 0] } },
                        shippingRevenue: { $sum: { $cond: [{ $eq: ["$isPaid", true] }, { $ifNull: ["$shippingPrice", 0] }, 0] } },
                        expectedRevenue: { $sum: "$totalPrice" },
                        paidOrders: { $sum: { $cond: [{ $eq: ["$isPaid", true] }, 1, 0] } },
                        unpaidOrders: { $sum: { $cond: [{ $eq: ["$isPaid", false] }, 1, 0] } },
                    }
                }
            ]),
            
            // 2. Chỉ số AI per-item
            Order.aggregate([
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
            ]),

            // 3. Top theo số lượng
            Order.aggregate(buildTopProductsPipeline("totalQty")),

            // 4. Top theo doanh thu
            Order.aggregate(buildTopProductsPipeline("totalRevenue")),

            // 5. Cảnh báo tồn kho
            InventoryThreshold.find({}).populate("product", "name countInStock sold").lean()
        ]);

        // ─────────────────────────────────────────
        // Xử lý dữ liệu sau khi query xong và làm tròn số thập phân (VNĐ không có số lẻ)
        // ─────────────────────────────────────────
        const orderStats = orderStatsArr[0] || null;
        const totalOrders = orderStats?.totalOrders || 0;
        const actualRevenue = Math.round(orderStats?.actualRevenue || 0);
        const shippingRevenue = Math.round(orderStats?.shippingRevenue || 0);
        const netProductRevenue = Math.round(Math.max(0, actualRevenue - shippingRevenue));
        const expectedRevenue = Math.round(orderStats?.expectedRevenue || 0);
        const paidOrders = orderStats?.paidOrders || 0;
        const unpaidRate = totalOrders > 0
            ? Number(((orderStats?.unpaidOrders || 0) / totalOrders * 100).toFixed(1))
            : 0;

        const aiGroups = { organic: {}, chatbot: {}, rag_recommendation: {} };
        aiItemStats.forEach(g => {
            const key = g._id || "organic";
            aiGroups[key] = {
                itemRevenue: g.itemRevenue || 0,
                itemCount: g.itemCount || 0,
                orderCount: g.orderCount || 0,
            };
        });

        const organicRevenue = Math.round(aiGroups.organic?.itemRevenue || 0);
        const chatbotRevenue = Math.round(aiGroups.chatbot?.itemRevenue || 0);
        const ragRevenue = Math.round(aiGroups.rag_recommendation?.itemRevenue || 0);
        const aiRevenue = chatbotRevenue + ragRevenue;
        const aiRevenuePercent = netProductRevenue > 0
            ? Number((aiRevenue / netProductRevenue * 100).toFixed(1))
            : 0;

        const organicOrderCount = aiGroups.organic?.orderCount || 0;
        const chatbotOrderCount = aiGroups.chatbot?.orderCount || 0;
        const ragOrderCount = aiGroups.rag_recommendation?.orderCount || 0;
        const aiOrderCount = chatbotOrderCount + ragOrderCount;

        const lowStockWarnings = thresholds
            .filter(t => t.product && (t.product.countInStock || 0) <= t.safeStockLevel)
            .map(t => ({
                productId: t.product._id,
                productName: t.product.name,
                countInStock: t.product.countInStock || 0,
                safeStockLevel: t.safeStockLevel,
                sold: t.product.sold || 0,
                severity: (t.product.countInStock || 0) === 0 ? "critical" : "warning",
            }))
            .sort((a, b) => a.countInStock - b.countInStock);

        const topProductsByRevenueRounded = topProductsByRevenue.map(p => ({
            ...p,
            totalRevenue: Math.round(p.totalRevenue || 0)
        }));

        const resultData = {
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
            topProductsByRevenue: topProductsByRevenueRounded,
            lowStockWarnings,
        };

        // Lưu vào Cache
        cache.set(cacheKey, { timestamp: Date.now(), data: resultData });

        // Tự dọn rác cache để tránh memory leak (giữ lại 10 keys gần nhất)
        if (cache.size > 10) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }

        return {
            status: "OK",
            data: resultData
        };

    } catch (e) {
        throw e;
    }
};

module.exports = {
    getRevenueStats
};
