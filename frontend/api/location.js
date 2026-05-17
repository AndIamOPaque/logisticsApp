import api from './client';

export const fetchLocations = async (queryParams = {}) => {
  const response = await api.get('/location', { params: queryParams });
  return response.data;
};

export const fetchLocationById = async (id) => {
  const response = await api.get(`/location/${id}`);
  return response.data;
};

export const createLocation = async (data) => {
  const response = await api.post('/location', data);
  return response.data;
};

export const updateLocation = async (id, data) => {
  const response = await api.patch(`/location/${id}`, data);
  return response.data;
};

export const deactivateLocation = async (id, force = false) => {
  const response = await api.delete(`/location/${id}`, { params: { force } });
  return response.data;
};
