import { axiosJWT } from "./UserService";

/**
 * Lấy thống kê doanh thu & AI analytics cho admin
 * @param {string} access_token - Admin token
 * @param {{ from?: string, to?: string }} params - Bộ lọc ngày (ISO string hoặc 'YYYY-MM-DD')
 */
export const getRevenueStats = async (access_token, params = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);

    const res = await axiosJWT.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/revenue/stats?${query.toString()}`,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        }
    );
    return res.data;
};
