import axios from "axios";
import { getToken } from "./auth.js";

// ✅ Use your deployed backend
const API_BASE_URL = "https://inventory-system-springboot-sea.onrender.com/v1/product";

//const API_BASE_URL = "http://localhost:8080/v1/product";

// Helper to include Authorization header
const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
});

// Get all products with pagination
export const getAllProducts = async (page = 0, size = 10, sort = "itemName,asc") => {
  const response = await axios.get(API_BASE_URL, {
    params: { page, size, sort },
    ...authHeader(),
  });
  return response.data; // this includes content, totalPages, totalElements, etc.
};

// Search products with pagination and filters
export const getProduct = async (itemName = "", category = "", page = 0, size = 10, sort = "itemName,asc") => {
  const response = await axios.get(`${API_BASE_URL}/search`, {
    params: { itemName, category, page, size, sort },
    ...authHeader(),
  });
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
