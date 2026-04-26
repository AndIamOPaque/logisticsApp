import api from './client';

export const fetchRawMaterials = async (params = {}) => {
  const response = await api.get('/raw-material', { params });
  return response.data;
};

export const fetchRawMaterialById = async (id) => {
  const response = await api.get(`/raw-material/${id}`);
  return response.data.data;
};

export const createRawMaterial = async (data) => {
  const response = await api.post('/raw-material', data);
  return response.data;
};

export const updateRawMaterial = async (id, data) => {
  const response = await api.put(`/raw-material/${id}`, data);
  return response.data;
};

export const correctRawMaterialStock = async (id, data) => {
  const response = await api.post(`/raw-material/${id}/correct-stock`, data);
  return response.data;
};

export const fetchRawMaterialStockLevels = async (id) => {
  const response = await api.get(`/raw-material/${id}/stock-level`);
  return response.data.data;
};
