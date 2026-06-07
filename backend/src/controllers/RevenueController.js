const RevenueService = require("../services/RevenueService");

// =============================================
// GET /api/revenue/stats?from=&to=
// Chỉ admin mới được truy cập
// =============================================
const getRevenueStats = async (req, res) => {
    try {
        const { from, to } = req.query;

        // Xây dựng bộ lọc thời gian
        let dateFilter = {};
        if (from || to) {
            dateFilter.createdAt = {};
            if (from) dateFilter.createdAt.$gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                dateFilter.createdAt.$lte = toDate;
            }
        }

        const response = await RevenueService.getRevenueStats(dateFilter);
        
        // Cấu trúc response theo định dạng của hệ thống
        return res.status(200).json({
            status: response.status,
            data: {
                ...response.data,
                generatedAt: new Date().toISOString(),
                filter: { from: from || null, to: to || null },
            }
        });

    } catch (e) {
        console.error("[RevenueController] getRevenueStats error:", e);
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Không thể tải dữ liệu doanh thu."
        });
    }
};

module.exports = { 
    getRevenueStats 
};
