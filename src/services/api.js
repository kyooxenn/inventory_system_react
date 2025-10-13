import axios from "axios";
import { getToken } from "./auth.js";

// ✅ Use your deployed backend
const API_BASE_URL = "https://inventory-system-dair.onrender.com/v1/product";

// Helper to include Authorization header
const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
});

export const getAllProducts = async () => {
  const response = await axios.get(API_BASE_URL, authHeader());
  return response.data;
};

export const getProduct = async (itemName) => {
  const response = await axios.get(
    `${API_BASE_URL}/details/${itemName}`,
    authHeader()
  );
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`, authHeader());
  return response.data;
};

export const createProduct = async (productRequest) => {
  const response = await axios.post(API_BASE_URL, productRequest, authHeader());
  return response.data;
};

export const updateProduct = async (id, productRequest) => {
  const response = await axios.put(
    `${API_BASE_URL}/${id}`,
    productRequest,
    authHeader()
  );
  return response.data;
};

export const deleteProduct = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`, authHeader());
  } catch (error) {
    console.error("Delete Error:", error);
  }
};
