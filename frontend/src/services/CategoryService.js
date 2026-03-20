import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL_BACKEND}/category`;

export const getAllCategories = async () => {
  const res = await axios.get(`${API_URL}/get-all-categories`);
  return res.data;
};

export const getCategoryById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createCategory = async (data) => {
  const res = await axios.post(`${API_URL}/create-category`, data);
  return res.data;
};

export const updateCategory = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
}; 