import axios from "axios";
import { axiosJWT } from "./UserService";

export const getOrCreateConversation = async (access_token) => {
    const res = await axiosJWT.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/chat/get-or-create-conversation`,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        }
    );
    return res.data;
};

export const getOrCreateGuestConversation = async (guestId) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/chat/get-or-create-guest`,
        {
            params: { guestId },
        }
    );
    return res.data;
};

export const getConversationMessages = async (conversationId, access_token, before = null) => {
    const res = await axiosJWT.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/chat/get-conversation-messages/${conversationId}`,
        {
            params: before ? { before } : {},
            headers: {
                token: `Bearer ${access_token}`,
            },
        }
    );
    return res.data;
};

export const getAdminConversations = async (access_token) => {
    const res = await axiosJWT.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/chat/get-admin-conversations`,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        }
    );
    return res.data;
};

export const getProductDetails = async (productId) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/product/get-details-product/${productId}`,
        { withCredentials: true }
    );
    return res.data;
};
