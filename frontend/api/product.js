import api from './client.js';

export const fetchProducts = async (queryParams = {}) => {
  const response = await api.get('/product', { params: queryParams });
  return response.data.data;
};


export const getStockLevels = async (id, queryParams = {}) => {
  try {
    const response = await api.get(`/product/${id}/stock-level`, { params: queryParams });
    return response.data.data || response.data; 
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to load stock levels';
    throw new Error(message);
  }
};


export const correctStock = async (id, adjustmentData) => {
  try {
    const response = await api.post(`/product/${id}/correct-stock`, adjustmentData);
    return response.data; 
  } catch (err) {
    const message = err.response?.data?.message || 'Stock correction failed';
    throw new Error(message); 
  }
};

export const fetchProductById = async (id) => {
  const response = await api.get(`/product/${id}`);
  return response.data.data;
};

export const fetchProductLogs = async (id) => {
  const response = await api.get(`/product/${id}/logs`);
  return response.data.data;
};