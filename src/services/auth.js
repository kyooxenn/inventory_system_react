import axios from "axios";

//const API_BASE_URL = "http://localhost:8080/api/auth"; // adjust if needed

//deploy online render
const API_BASE_URL = "https://inventory-system-springboot-sea.onrender.com/api/auth";

// ✅ LOGIN
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { username, password });

    if (response.status === 200 && response.data.token) {
      localStorage.setItem("token", response.data.token);
      return response.data; // { token: "..." }
    } else {
      throw new Error(response.data.error || "Login failed");
    }
  } catch (error) {
    const message =
      error.response?.data?.error ||
      (error.response?.status === 401
        ? "Invalid username or password"
        : "Login failed");
    throw new Error(message);
  }
};

// ✅ REGISTER
export const register = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, { username, password });

    if (response.status === 201 || response.status === 200) {
      return response.data.message || "Registration successful!";
    } else {
      throw new Error(response.data.error || "Registration failed");
    }
  } catch (error) {
    const message =
      error.response?.data?.error ||
      (error.response?.status === 409
        ? "Username already exists"
        : "Registration failed");
    throw new Error(message);
  }
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getToken = () => localStorage.getItem("token");
