import axios from 'axios';
import { axiosJWT } from './UserService';

const API = process.env.REACT_APP_API_URL_BACKEND;

/**
 * Lấy danh sách notifications (cần đăng nhập)
 */
export const getNotifications = async (access_token) => {
    const res = await axiosJWT.get(`${API}/notification`, {
        headers: { token: `Bearer ${access_token}` },
    });
    return res.data;
};

/**
 * Đếm số thông báo chưa đọc
 */
export const getUnreadCount = async (access_token) => {
    const res = await axiosJWT.get(`${API}/notification/unread-count`, {
        headers: { token: `Bearer ${access_token}` },
    });
    return res.data;
};

/**
 * Đánh dấu một notification đã đọc
 */
export const markAsRead = async (notificationId, access_token) => {
    const res = await axiosJWT.patch(
        `${API}/notification/${notificationId}/read`,
        {},
        { headers: { token: `Bearer ${access_token}` } }
    );
    return res.data;
};

/**
 * Đánh dấu tất cả notifications đã đọc
 */
export const markAllAsRead = async (access_token) => {
    const res = await axiosJWT.patch(
        `${API}/notification/read-all`,
        {},
        { headers: { token: `Bearer ${access_token}` } }
    );
    return res.data;
};

/**
 * Admin: Broadcast Flash Sale notification
 */
export const broadcastFlashSale = async (data, access_token) => {
    const res = await axiosJWT.post(
        `${API}/notification/flash-sale`,
        data,
        { headers: { token: `Bearer ${access_token}` } }
    );
    return res.data;
};

/**
 * Đăng ký nhận thông báo khi sản phẩm có hàng
 */
export const subscribeRestock = async (productId, access_token) => {
    const res = await axiosJWT.post(
        `${API}/product/${productId}/subscribe-restock`,
        {},
        { headers: { token: `Bearer ${access_token}` } }
    );
    return res.data;
};
