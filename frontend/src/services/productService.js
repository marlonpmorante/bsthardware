// src/services/productService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Helper to get auth token from localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- Public Access Methods (for User Dashboard) ---

const getProducts = async () => {
    try {
        const response = await axios.get(`${API_URL}/products`);
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error.response?.data?.message || error.message);
        throw error;
    }
};

const getProductById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error.response?.data?.message || error.message);
        throw error;
    }
};


// --- Admin Access Methods (requires token) ---

const addProduct = async (productData) => {
    try {
        const response = await axios.post(`${API_URL}/products`, productData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error adding product:', error.response?.data?.message || error.message);
        throw error;
    }
};

const updateProduct = async (id, productData) => {
    try {
        const response = await axios.put(`${API_URL}/products/${id}`, productData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error updating product ${id}:`, error.response?.data?.message || error.message);
        throw error;
    }
};

const deleteProduct = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/products/${id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error deleting product ${id}:`, error.response?.data?.message || error.message);
        throw error;
    }
};

// productService.js
const productService = {
  getProducts: async () => { /* ... */ },
  deleteProduct: async (id) => { /* ... */ },
  addProduct: async (data) => { /* ... */ }
  // ... and so on
};
export default productService;