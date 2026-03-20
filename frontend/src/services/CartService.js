import axios from 'axios'

const API = `${process.env.REACT_APP_API_URL_BACKEND}/cart`

const resolveToken = (access_token) => {
  if (!access_token) return null
  if (typeof access_token !== 'string') return access_token

  try {
    return JSON.parse(access_token)
  } catch (error) {
    return access_token
  }
}

export const getCart = async (userId, access_token) => {
  const token = resolveToken(access_token)
  const res = await axios.get(`${API}/${userId}`, {
    headers: {
      token: `Bearer ${token}`,
    },
    withCredentials: true,
  })
  return res.data
}

export const updateCart = async (userId, items, access_token) => {
  const token = resolveToken(access_token)
  const res = await axios.post(API, { userId, items }, {
    headers: {
      token: `Bearer ${token}`,
    },
    withCredentials: true,
  })
  return res.data
}

export const deleteCart = async (userId, access_token) => {
  const token = resolveToken(access_token)
  const res = await axios.delete(`${API}/${userId}`, {
    headers: {
      token: `Bearer ${token}`,
    },
    withCredentials: true,
  })
  return res.data
}