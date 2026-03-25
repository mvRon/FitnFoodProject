import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL_BACKEND}/category`;

export const axiosJWT = axios.create({
  withCredentials: true
});

export const getAllCategories = async () => {
  const res = await axios.get(`${API_URL}/get-all-categories`);
  return res.data;
};

export const getCategoryById = async (id) => {
  const res = await axios.get(`${API_URL}/get-category/${id}`);
  return res.data;
};

export const createCategory = async (data, access_token) => {
  const res = await axiosJWT.post(`${API_URL}/create-category`, data, {
    headers: {
      token: `Bearer ${access_token}`,
    }
  });
  return res.data;
};

export const updateCategory = async (id, data, access_token) => {
  const res = await axiosJWT.put(`${API_URL}/update-category/${id}`, data, {
    headers: {
      token: `Bearer ${access_token}`,
    }
  });
  return res.data;
};

export const deleteCategory = async (id, access_token) => {
  const res = await axiosJWT.delete(`${API_URL}/delete-category/${id}`, {
    headers: {
      token: `Bearer ${access_token}`,
    }
  });
  return res.data;
}; 