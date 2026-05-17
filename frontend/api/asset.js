import api from './client';

export const fetchAssets = async (queryParams = {}) => {
  const response = await api.get('/asset', { params: queryParams });
  return response.data;
};

export const fetchAssetById = async (id) => {
  const response = await api.get(`/asset/${id}`);
  return response.data;
};

export const createAsset = async (data) => {
  const response = await api.post('/asset', data);
  return response.data;
};

export const updateAsset = async (id, data) => {
  const response = await api.patch(`/asset/${id}`, data);
  return response.data;
};

export const addServiceRecord = async (id, data) => {
  const response = await api.post(`/asset/${id}/service`, data);
  return response.data;
};

export const deleteAsset = async (id) => {
  const response = await api.delete(`/asset/${id}`);
  return response.data;
};
