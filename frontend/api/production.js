import api from './client';

export const fetchProductions = async (queryParams = {}) => {
  const response = await api.get('/production-order', { params: queryParams });
  if (response.status !== 200) {
    throw new Error(response.data.message || 'Could not load Productions');
  }
  return response.data.data;
};

export const fetchProductionById = async (id) => {
  const response = await api.get(`/production-order/${id}`);
  return response.data.data;
};

export const createProductionOrder = async (orderData) => {
  const response = await api.post('/production-order', orderData);
  return response.data;
};

export const recordProductionOutput = async (id, body) => {
  const response = await api.patch(`/production-order/${id}/product-output`, body);
  return response.data;
};

export const logMaterialUsage = async (id, body) => {
  const response = await api.patch(`/production-order/${id}/material-usage`, body);
  return response.data;
};

export const returnMaterials = async (id, body) => {
  const response = await api.patch(`/production-order/${id}/return-material`, body);
  return response.data;
};

export const changeProductionStatus = async (id, body) => {
  const response = await api.patch(`/production-order/${id}/status`, body);
  return response.data;
};

// Fetches all inventory moves linked to this production order
export const fetchProductionLogs = async (orderId) => {
  const response = await api.get(`/production-order/${orderId}/logs`);
  return response.data.data;
};