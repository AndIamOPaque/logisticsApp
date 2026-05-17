import api from './client';

export const fetchParties = async (queryParams = {}) => {
  const response = await api.get('/party', { params: queryParams });
  return response.data;
};

export const fetchPartyById = async (id) => {
  const response = await api.get(`/party/${id}`);
  return response.data;
};

export const createParty = async (data) => {
  const response = await api.post('/party', data);
  return response.data;
};

export const updateParty = async (id, data) => {
  const response = await api.patch(`/party/${id}`, data);
  return response.data;
};

export const deleteParty = async (id) => {
  const response = await api.delete(`/party/${id}`);
  return response.data;
};
