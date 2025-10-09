import axios from "axios";

//const API_BASE_URL = "http://localhost:8080/v1/product";

//deploy online render
const API_BASE_URL = "https://inventory-system-dair.onrender.com/v1/product";

export const getAllProducts = async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data;
};

export const getProduct = async (productName) => {
    const response = await axios.get(`${API_BASE_URL}/name/${productName}`);
    return response.data;
};

export const getProductById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/id/${id}`);
    return response.data;
};

export const createProduct = async (productRequest) => {
    const response = await axios.post(API_BASE_URL, productRequest);
    return response.data;
};

export const updateProduct = async (id, productRequest) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, productRequest);
    return response.data;
};

export const deleteProduct = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
        console.error("Delete Error:", error);
    }
};