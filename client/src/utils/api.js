import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance with base URL and common headers
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API methods for leads
export const leadApi = {
    // Create a new lead
    createLead: async(leadData) => {
        try {
            const response = await api.post('/leads', leadData);
            return response.data;
        } catch (error) {
            const axiosError = (error.response && error.response.data) || { success: false, message: 'An error occurred' };
            throw axiosError;
        }
    },

    // Edit an existing lead
    editLead: async(leadId, leadData) => {
        try {
            const response = await api.put(`/leads/${leadId}`, leadData);
            return response.data;
        } catch (error) {
            const axiosError = (error.response && error.response.data) || {
                success: false,
                message: 'Failed to update lead',
                errors: (error.response && error.response.data && error.response.data.errors) || []
            };
            throw axiosError;
        }
    },

    // Get a single lead by ID
    getLead: async(leadId) => {
        try {
            const response = await api.get(`/leads/${leadId}`);
            return response.data.data;
        } catch (error) {
            const axiosError = (error.response && error.response.data) || {
                success: false,
                message: 'Failed to fetch lead',
                errors: (error.response && error.response.data && error.response.data.errors) || []
            };
            throw axiosError;
        }
    },

    // Get all leads with pagination
    getLeads: async(page = 1, limit = 10, status = '') => {
        try {
            const response = await api.get('/leads', {
                params: { page, limit, status },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching leads:', error);
            // Removed unnecessary parentheses here
            throw (error.response && error.response.data) || { success: false, message: 'Error fetching leads' };
        }
    },

    // Update a lead's status or other details
    updateLead: async(leadId, leadData) => {
        try {
            const response = await api.put(`/leads/${leadId}`, leadData);
            return response.data;
        } catch (error) {
            console.error('Error updating lead:', error);
            // Removed unnecessary parentheses here
            throw (error.response && error.response.data) || { success: false, message: 'Error updating lead' };
        }
    },

    // Delete a lead
    deleteLead: async(leadId) => {
        try {
            const response = await api.delete(`/leads/${leadId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting lead:', error);
            // Removed unnecessary parentheses here
            throw (error.response && error.response.data) || { success: false, message: 'Error deleting lead' };
        }
    },
};

// Export as default for backward compatibility
export default leadApi;