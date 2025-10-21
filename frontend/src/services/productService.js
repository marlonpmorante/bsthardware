// src/services/productService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Helper to get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- Public Access Methods (for User Dashboard) ---

export const getProducts = async () => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}/products/${id}`);
  return response.data;
};

// --- Admin Access Methods (requires token) ---

export const addProduct = async (productData) => {
  const response = await axios.post(`${API_URL}/products`, productData, { headers: getAuthHeaders() });
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axios.put(`${API_URL}/products/${id}`, productData, { headers: getAuthHeaders() });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_URL}/products/${id}`, { headers: getAuthHeaders() });
  return response.data;
};