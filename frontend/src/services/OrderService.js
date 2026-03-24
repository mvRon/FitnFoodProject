import { axiosJWT } from "./UserService";


export const createOrder = async (access_token, data) => {
    const res = await axiosJWT.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/order`, data, {
        headers: {
            token: `Bearer ${access_token}`,
        },
    })
    return res.data;
};


export const getAllOrder = async (access_token, id) => {
    const res = await axiosJWT.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/order`, {
        headers: {
            token: `Bearer ${access_token}`,
        },
    })
    return res.data;
};


export const getDetailOrder = async (access_token, id) => {
    const res = await axiosJWT.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/order/${id}`, {
        headers: {
            token: `Bearer ${access_token}`,
        },
    })
    return res.data;
};


export const deleteOrder = async (access_token, id) => {
    const res = await axiosJWT.delete(
        `${process.env.REACT_APP_API_URL_BACKEND}/order/${id}`, {
        headers: {
            token: `Bearer ${access_token}`,
        },
    })
    return res.data;
};


export const getAllOrders = async (access_token) => {
    const res = await axiosJWT.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/order/admin/all`, {
        headers: {
            token: `Bearer ${access_token}`,
        },
    })
    return res.data;
};


export const updateOrder = async (id, token, updateData) => {
    const res = await axiosJWT.put(
        `${process.env.REACT_APP_API_URL_BACKEND}/order/${id}`, updateData, {
            headers: {
                token: `Bearer ${token}`,
            }
        }
    )
    return res.data;
}

