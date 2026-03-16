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

export const getDetailUser = async (id, acces_token) => {
    const res = await axiosJWT.get(`${process.env.REACT_APP_API_URL_BACKEND}/user/getDetailUser/${id}`, {
        headers: {
            token: `Bearer ${acces_token}`,
        }
    });
    return res.data;
};


//byRon
export const refreshToken = async (refresh_token) => {
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/user/refreshToken`,
        {},{
            headers: {
                token: `Bearer ${refresh_token}`,
            }
        },
        { withCredentials: true }
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
    const res = await axiosJWT.put(`${process.env.REACT_APP_API_URL_BACKEND}/user/updateUser/${id}`, data, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    });
    return res.data;
};


export const deleteUser = async (id, access_token) => {
    const res = await axiosJWT.delete(`${process.env.REACT_APP_API_URL_BACKEND}/user/deleteUser/${id}`, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    });
    return res.data;
};


export const getAllUser = async (acces_token) => {
    const res = await axiosJWT.get(`${process.env.REACT_APP_API_URL_BACKEND}/user/getAll`, {
        headers: {
            token: `Bearer ${acces_token}`,
        }
    });
    return res.data;
};


export const deleteManyUser = async (ids, access_token) => {
    const res = await axiosJWT.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/user/deleteManyUser`, ids, {
        headers: {
            token: `Bearer ${access_token}`,
        }, 
    })
    return res.data;
};