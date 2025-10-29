import axios from "axios";
import { getToken } from "./auth.js";

//const API_BASE_URL = "http://localhost:8080/v1/product"; // adjust if needed

// ✅ Ensure your deployed backend is accessible online when rendering the application.
const API_BASE_URL = "https://inventory-system-springboot-sea.onrender.com/v1/product";

// Helper to include Authorization header
const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
});

// Helper function to handle auth errors (optional, for reuse)
const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    // Clear token and redirect to login
    localStorage.removeItem('token');  // Or your token storage method
    window.location.href = '/login';  // Or use React Router: navigate('/login')
    throw new Error('Session expired. Please log in again.');
  } else if (error.response?.status === 403) {
    throw new Error('You do not have permission to perform this action.');
  } else {
    throw new Error(error.response?.data?.message || 'An unexpected error occurred.');
  }
};


// Get all products with pagination
export const getAllProducts = async (page = 0, size = 10, sort = "itemName,asc") => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params: { page, size, sort },
      ...authHeader(),
    });
    return response.data;  // Success: return data
  } catch (error) {
    console.error("Get All Products Error:", error);
    handleAuthError(error);  // Handle 401/403
    // For other errors, throw or return an error object
    throw error;  // Or return { success: false, message: error.message }
  }
};

// Search products with pagination and filters
export const getProduct = async (itemName = "", category = "", page = 0, size = 10, sort = "itemName,asc") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: { itemName, category, page, size, sort },
      ...authHeader(),
    });
    return response.data;  // Success: return data
  } catch (error) {
    console.error("Search Products Error:", error);
    handleAuthError(error);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, authHeader());
    return response.data;  // Success: return data
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    handleAuthError(error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (productRequest) => {
  try {
    const response = await axios.post(API_BASE_URL, productRequest, authHeader());
    return response.data;  // Success: return data
  } catch (error) {
    console.error("Create Product Error:", error);
    handleAuthError(error);
    throw error;
  }
};

// Update an existing product
export const updateProduct = async (id, productRequest) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/${id}`,
      productRequest,
      authHeader()
    );
    return response.data;  // Success: return data
  } catch (error) {
    console.error("Update Product Error:", error);
    handleAuthError(error);
    throw error;
  }
};

// Delete a product (already had try-catch, but updated for consistency)
export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`, authHeader());
    return response.data || { success: true };  // Success: return data or confirmation
  } catch (error) {
    console.error("Delete Product Error:", error);
    handleAuthError(error);
    throw error;
  }
};
