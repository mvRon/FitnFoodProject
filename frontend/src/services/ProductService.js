import axios from "axios";
import { axiosJWT } from "./UserService";

export const getAllProduct = async (search, page = 1, limit = 5, includeImages = false) => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));
    queryParams.append("includeImages", String(includeImages));

    if (search) {
        queryParams.append("filter", "name");
        queryParams.append("filter", search);
    }

    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/product/get-all-products?${queryParams.toString()}`,
        { withCredentials: true }
    );

    return res.data;
};

export const getProductByType = async (typeId, page, limit) => {
    let res = {};
    if (typeId) {
        const queryParams = new URLSearchParams();
        queryParams.append("filter", "typeId");
        queryParams.append("filter", typeId);
        queryParams.append("limit", String(limit || 5));
        queryParams.append("page", String(page || 1));
        queryParams.append("includeImages", "true");

        res = await axios.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/product/get-all-products?${queryParams.toString()}`,
            { withCredentials: true }
        );
        return res.data;
    }
    return res.data;
};

export const createProduct = async (data, access_token) => {
    const res = await axiosJWT.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/product/create-product`,
        data,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        }
    );
    return res.data;
};

export const commentProduct = async (id, access_token, data) => {
    const res = await axiosJWT.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/product/${id}/review`,
        data,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        }
    );
    return res.data;
};

export const getAllComment = async (id) => {
    // Sử dụng axios thường, không truyền access_token, không truyền header
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/product/${id}/reviews`
    );
    return res.data;
};

export const getDetailProduct = async (id) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/product/get-details-product/${id}`,
        { withCredentials: true }
    );
    return res.data;
};

export const updateProduct = async (id, access_token, data) => {
    const res = await axiosJWT.put(
        `${process.env.REACT_APP_API_URL_BACKEND}/product/update-product/${id}`,
        data,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        }
    );
    return res.data;
};

export const deleteProduct = async (id, access_token) => {
    const res = await axiosJWT.delete(
        `${process.env.REACT_APP_API_URL_BACKEND}/product/delete-product/${id}`,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        }
    );
    return res.data;
};

export const deleteManyProduct = async (ids, access_token) => {
    const res = await axiosJWT.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/product/delete-many-products`,
        ids,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        }
    );
    return res.data;
};

export const getAllTypeProduct = async () => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/product/get-all-type-products`,
    );
    return res.data;
};

export const addCommentProduct = async (id, access_token, data) => {
    const res = await axiosJWT.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/product/${id}/comment`,
        data,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        }
    );
    return res.data;
};

// Kiểm tra quyền đánh giá sản phẩm
export const checkRatingPermission = async (productId, access_token) => {
    try {
        const res = await axiosJWT.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/product/${productId}/check-rating-permission`,
            {
                headers: {
                    token: `Bearer ${access_token}`,
                },
            }
        );
        return res.data;
    } catch (err) {
        return { status: 'ERROR', message: err.response?.data?.message || err.message };
    }
};

export const addRatingProduct = async (id, access_token, data) => {
    try {
        const res = await axiosJWT.post(
            `${process.env.REACT_APP_API_URL_BACKEND}/product/${id}/rating`,
            data,
            {
                headers: {
                    token: `Bearer ${access_token}`,
                },
            }
        );
        return res.data;
    } catch (err) {
        return { status: 'ERROR', message: err.response?.data?.message || err.message };
    }
};

export const addReplyToReview = async (productId, reviewId, access_token, data) => {
    try {
        const res = await axiosJWT.post(
            `${process.env.REACT_APP_API_URL_BACKEND}/product/${productId}/reviews/${reviewId}/replies`,
            data,
            {
                headers: {
                    token: `Bearer ${access_token}`,
                },
            }
        );
        return res.data;
    } catch (err) {
        return { status: 'ERR', message: err.response?.data?.message || err.message };
    }
};

export const updateReplyOfReview = async (productId, reviewId, replyId, access_token, data) => {
    try {
        const res = await axiosJWT.put(
            `${process.env.REACT_APP_API_URL_BACKEND}/product/${productId}/reviews/${reviewId}/replies/${replyId}`,
            data,
            {
                headers: {
                    token: `Bearer ${access_token}`,
                },
            }
        );
        return res.data;
    } catch (err) {
        return { status: 'ERR', message: err.response?.data?.message || err.message };
    }
};

export const deleteReplyOfReview = async (productId, reviewId, replyId, access_token) => {
    try {
        const res = await axiosJWT.delete(
            `${process.env.REACT_APP_API_URL_BACKEND}/product/${productId}/reviews/${reviewId}/replies/${replyId}`,
            {
                headers: {
                    token: `Bearer ${access_token}`,
                },
            }
        );
        return res.data;
    } catch (err) {
        return { status: 'ERR', message: err.response?.data?.message || err.message };
    }
};

export const updateCommentProduct = async (productId, reviewId, access_token, data) => {
    try {
        const res = await axiosJWT.put(
            `${process.env.REACT_APP_API_URL_BACKEND}/product/${productId}/comment/${reviewId}`,
            data,
            {
                headers: {
                    token: `Bearer ${access_token}`,
                },
            }
        );
        return res.data;
    } catch (err) {
        return { status: 'ERR', message: err.response?.data?.message || err.message };
    }
};

export const deleteCommentProduct = async (productId, reviewId, access_token) => {
    try {
        const res = await axiosJWT.delete(
            `${process.env.REACT_APP_API_URL_BACKEND}/product/${productId}/reviews/${reviewId}`,
            {
                headers: {
                    token: `Bearer ${access_token}`,
                },
            }
        );
        return res.data;
    } catch (err) {
        return { status: 'ERR', message: err.response?.data?.message || err.message };
    }
};

export const searchProducts = async (query, options = {}) => {
    const {
        limit = 24,
        includeImages = true,
        page = 1,
        typeId,
    } = options;

    const queryParams = new URLSearchParams();
    queryParams.append("q", query || "");
    queryParams.append("limit", String(limit));
    queryParams.append("page", String(page));
    queryParams.append("includeImages", String(includeImages));
    if (typeId) {
        queryParams.append("typeId", String(typeId));
    }

    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/product/search-products?${queryParams.toString()}`,
        { withCredentials: true }
    );

    return res.data;
};