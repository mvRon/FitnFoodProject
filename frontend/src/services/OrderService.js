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


export const getAllOrder = async (access_token, id, dateRange) => {
    let url = `${process.env.REACT_APP_API_URL_BACKEND}/order?includeImage=false`;
    if (dateRange?.from && dateRange?.to) {
        url += `&startDate=${dateRange.from}&endDate=${dateRange.to}`;
    }
    const res = await axiosJWT.get(url, {
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


export const getAllOrders = async (access_token, dateRange) => {
    let url = `${process.env.REACT_APP_API_URL_BACKEND}/order/admin/all`;
    if (dateRange?.from && dateRange?.to) {
        url += `?startDate=${dateRange.from}&endDate=${dateRange.to}`;
    }
    const res = await axiosJWT.get(url, {
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

// =============================================
// PayOS Payment Functions
// =============================================

/**
 * Tạo payment link PayOS — trả về { qrCode, checkoutUrl, orderId, payosOrderCode }
 */
export const createPaymentLink = async (access_token, data) => {
    const res = await axiosJWT.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/payment/create-payment-link`,
        data,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        }
    );
    return res.data;
};

/**
 * Hủy payment link (frontend gọi khi countdown hết hoặc user chủ động hủy)
 */
export const cancelPayment = async (access_token, orderId) => {
    const res = await axiosJWT.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/payment/cancel`,
        { orderId },
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        }
    );
    return res.data;
};
