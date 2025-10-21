// src/services/authService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL; // From .env.local

// Function to handle user login
const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        // The backend should return { token, user }
        return response.data;
    } catch (error) {
        // Custom error handling for login failures
        console.error('Login API error:', error.response?.data?.message || error.message);
        throw error; // Re-throw to allow component to handle specific messages
    }
};

// Function to handle user signup
const signup = async (name, email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
        // The backend should return { token, user }
        return response.data;
    } catch (error) {
        // Custom error handling for signup failures
        console.error('Signup API error:', error.response?.data?.message || error.message);
        throw error;
    }
};

const authService = {
    login,
    signup,
};

export default authService;