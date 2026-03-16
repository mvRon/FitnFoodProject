import axios from 'axios'

const API = `${process.env.REACT_APP_API_URL_BACKEND}/cart/`

export const getCart = async (userId) => {
  const res = await axios.get(`${API}/${userId}`)
  return res.data
}

export const updateCart = async (userId, items) => {
  const res = await axios.post(API, { userId, items })
  return res.data
}

export const deleteCart = async (userId) => {
  const res = await axios.delete(`${API}/${userId}`)
  return res.data
}