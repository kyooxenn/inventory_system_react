import axios from "axios";

//const API_BASE_URL = "http://localhost:8080/api/auth"; // adjust if needed

//deploy online render
const API_BASE_URL = "https://inventory-system-dair.onrender.com/api/auth";

export const login = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
  localStorage.setItem("token", response.data.token);
  return response.data;
};

export const register = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/register`, { username, password });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getToken = () => localStorage.getItem("token");
