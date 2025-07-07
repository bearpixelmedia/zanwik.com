/**
 * userManagement API Service
 * Handles all userManagement related API calls
 */

import api from '../utils/api';

export const userManagementService = {
  /**
   * Get all userManagement items
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} userManagement items
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/userManagement', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching userManagement:', error);
      throw error;
    }
  },

  /**
   * Get single userManagement item by ID
   * @param {string} id - Item ID
   * @returns {Promise<Object>} userManagement item
   */
  getById: async id => {
    try {
      const response = await api.get(`/userManagement/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching userManagement by ID:', error);
      throw error;
    }
  },

  /**
   * Create new userManagement item
   * @param {Object} data - Item data
   * @returns {Promise<Object>} Created item
   */
  create: async data => {
    try {
      const response = await api.post('/userManagement', data);
      return response.data;
    } catch (error) {
      console.error('Error creating userManagement:', error);
      throw error;
    }
  },

  /**
   * Update userManagement item
   * @param {string} id - Item ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated item
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/userManagement/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating userManagement:', error);
      throw error;
    }
  },

  /**
   * Delete userManagement item
   * @param {string} id - Item ID
   * @returns {Promise<void>}
   */
  delete: async id => {
    try {
      await api.delete(`/userManagement/${id}`);
    } catch (error) {
      console.error('Error deleting userManagement:', error);
      throw error;
    }
  },
};

export default userManagementService;
