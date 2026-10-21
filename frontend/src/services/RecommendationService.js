import axios from "axios";
import { axiosJWT } from "./UserService";

const API = `${process.env.REACT_APP_API_URL_BACKEND}/product`;

const resolveToken = (access_token) => {
  if (!access_token) return null;
  if (typeof access_token !== "string") return access_token;
  try {
    return JSON.parse(access_token);
  } catch (error) {
    return access_token;
  }
};

export const getRecommendationsByProduct = async (productId, limit = 5) => {
  const queryParams = new URLSearchParams();
  if (limit) {
    queryParams.append("limit", String(limit));
  }

  const res = await axios.get(
    `${API}/get-recommendations-by-product/${productId}?${queryParams.toString()}`
  );

  return res.data;
};

export const getRecommendationsByCart = async (productIds, limit = 5, access_token) => {
  const token = resolveToken(access_token);
  const res = await axiosJWT.post(
    `${API}/get-recommendations-by-cart`,
    { productIds, limit },
    {
      headers: {
        token: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const getRecommendationsByHistory = async (access_token, limit = 5) => {
  const token = resolveToken(access_token);
  const queryParams = new URLSearchParams();
  if (limit) {
    queryParams.append("limit", String(limit));
  }

  const res = await axiosJWT.get(
    `${API}/get-recommendations-by-history?${queryParams.toString()}`,
    {
      headers: {
        token: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};


export const getRecommendationsByGuest = async (guestId, limit = 5) => {
  const queryParams = new URLSearchParams();
  if (guestId) {
    queryParams.append("guestId", guestId);
  }
  if (limit) {
    queryParams.append("limit", String(limit));
  };

  const res = await axios.get(
    `${API}/get-recommendations-by-guest?${queryParams.toString()}`
  );

  return res.data;
}