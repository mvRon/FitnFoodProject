import axios from "axios";

export const axiosJWT = axios.create({
    withCredentials: true
});



export const verifyUser = async (data) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/user/verify`, data);
    return res.data;
};

export const loginUser = async (data) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/user/login`, data, {
        withCredentials: true
    });
    return res.data;
};

export const registerUser = async (data) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/user/register`, data);
    return res.data;
};

export const getDetailUser = async (access_token) => {
    const res = await axiosJWT.get(`${process.env.REACT_APP_API_URL_BACKEND}/user/get-user-details`, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    });
    return res.data;
};

export const forgotPassword = async (data) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/user/forgot-password`, data);
    return res.data;
};

export const resetPassword = async (data) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/user/reset-password`, data);
    return res.data;
};

export const changePassword = async (data, access_token) => {
    const res = await axiosJWT.post(`${process.env.REACT_APP_API_URL_BACKEND}/user/change-password`, data, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    });
    return res.data;
};

//byRon
export const refreshToken = async (refresh_token) => {
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/user/refresh-token`,
        {},
        {
            headers: {
                token: `Bearer ${refresh_token}`,
            },
            withCredentials: true,
        }
    );
    return res.data;
};

export const logoutUser = async () => {
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/user/logout`,
        {},
        { withCredentials: true }
    );
    return res.data;
};


export const updateUser = async (id, access_token, data) => {
    const res = await axiosJWT.put(`${process.env.REACT_APP_API_URL_BACKEND}/user/update-user/${id}`, data, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    });
    return res.data;
};


export const deleteUser = async (id, access_token) => {
    const res = await axiosJWT.delete(`${process.env.REACT_APP_API_URL_BACKEND}/user/delete-user/${id}`, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    });
    return res.data;
};


export const getAllUser = async (access_token) => {
    const res = await axiosJWT.get(`${process.env.REACT_APP_API_URL_BACKEND}/user/get-all-users`, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    });
    return res.data;
};


export const deleteManyUser = async (ids, access_token) => {
    const requests = (ids || []).map((id) =>
        axiosJWT.delete(`${process.env.REACT_APP_API_URL_BACKEND}/user/delete-user/${id}`, {
            headers: {
                token: `Bearer ${access_token}`,
            },
        })
    );

    const responses = await Promise.all(requests);
    return {
        status: 'OK',
        data: responses.map((item) => item.data),
    };
};