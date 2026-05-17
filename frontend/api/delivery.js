import api from './client';

export const fetchDeliveries = async (queryParams = {}) => {
  const response = await api.get('/delivery', { params: queryParams });
  if (response.status !== 200) {
    throw new Error(response.data.message || 'Could not load deliveries');
  }
  return response.data.data;
};

export const fetchDeliveryById = async (id) => {
  const response = await api.get(`/delivery/${id}`);
  return response.data;
};

export const createDelivery = async (deliveryData) => {
  const response = await api.post('/delivery', deliveryData);
  return response.data;
};

export const changeDeliveryStatus = async (id, status) => {
  const response = await api.patch(`/delivery/${id}/status`, { newStatus: status });
  return response.data;
};
