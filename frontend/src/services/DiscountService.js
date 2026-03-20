// frontend/src/services/DiscountService.js
import axios from 'axios';
import { axiosJWT } from './UserService';

export const createDiscount = async (data, access_token) => {
    const res = await axiosJWT.post(`${process.env.REACT_APP_API_URL_BACKEND}/discount/create-discount`, data, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    });
    return res.data;
};

export const updateDiscount = async (id, data, access_token) => {
    const res = await axiosJWT.put(`${process.env.REACT_APP_API_URL_BACKEND}/discount/update-discount/${id}`, data, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    });
    return res.data;
};

export const updateDiscountUsesLeft = async (id, usesLeft, access_token) => {
    const res = await axiosJWT.put(`${process.env.REACT_APP_API_URL_BACKEND}/discount/update-discount/${id}`, { usesLeft }, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    });
    return res.data;
};

export const updateDiscountUsage = async (data, access_token) => {
    const res = await axiosJWT.post(`${process.env.REACT_APP_API_URL_BACKEND}/discount/use-discount`, data, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    });
    return res.data;
};

export const useDiscount = async (data, access_token) => {
    const res = await axiosJWT.post(`${process.env.REACT_APP_API_URL_BACKEND}/discount/use-discount`, data, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    });
    return res.data;
};

export const deleteDiscount = async (id, access_token) => {
    const res = await axiosJWT.delete(`${process.env.REACT_APP_API_URL_BACKEND}/discount/delete-discount/${id}`, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    });
    return res.data;
};

export const getAllDiscount = async (limit, page, sort, filter) => {
    let url = `${process.env.REACT_APP_API_URL_BACKEND}/discount/get-all-discounts?limit=${limit}&page=${page}`;
    if (sort) {
        url += `&sort=${sort[0]},${sort[1]}`;
    }
    if (filter) {
        url += `&filter=${filter[0]},${filter[1]}`;
    }
    const res = await axios.get(url); // Không cần token cho getAll
    return res.data;
};

export const getDetailDiscount = async (id) => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/discount/get-details-discount/${id}`); // Không cần token cho getDetail
    return res.data;
};
