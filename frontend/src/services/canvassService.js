// src/services/canvassService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const submitCanvassRequest = async (canvassData) => {
    try {
        const response = await axios.post(`${API_URL}/canvass/request`, canvassData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error submitting canvass request:', error.response?.data?.message || error.message);
        throw error;
    }
};

const getCanvassRequests = async () => {
    try {
        const response = await axios.get(`${API_URL}/canvass/requests`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error fetching canvass requests:', error.response?.data?.message || error.message);
        throw error;
    }
};

const updateCanvassRequestStatus = async (id, status) => {
    try {
        const response = await axios.put(`${API_URL}/canvass/requests/${id}/status`, { status }, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error updating canvass request ${id} status:`, error.response?.data?.message || error.message);
        throw error;
    }
};

const canvassService = {
    submitCanvassRequest,
    getCanvassRequests,
    updateCanvassRequestStatus,
};

export default canvassService;