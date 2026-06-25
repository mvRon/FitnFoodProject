import axios from 'axios';
import { axiosJWT } from './UserService';

const BASE_URL = process.env.REACT_APP_API_URL_BACKEND;

/**
 * Lấy cài đặt hệ thống hiện tại (public)
 */
export const getSystemSetting = async () => {
    const res = await axios.get(`${BASE_URL}/system-setting`);
    return res.data;
};

/**
 * Cập nhật cài đặt hệ thống (chỉ admin)
 * @param {object} data - Dữ liệu cần cập nhật
 * @param {string} accessToken - Admin JWT token
 */
export const updateSystemSetting = async (data, accessToken) => {
    const res = await axiosJWT.put(
        `${BASE_URL}/system-setting`,
        data,
        {
            headers: {
                token: `Bearer ${accessToken}`,
            },
        }
    );
    return res.data;
};
