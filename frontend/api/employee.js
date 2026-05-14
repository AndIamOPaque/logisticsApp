import api from './client';

export const fetchEmployees = async (queryParams = {}) => {
  const response = await api.get('/employee', { params: queryParams });
  return response.data;
};

export const fetchEmployeeById = async (id) => {
  const response = await api.get(`/employee/${id}`);
  return response.data;
};

export const createEmployee = async (data) => {
  const response = await api.post('/employee', data);
  return response.data;
};

export const updateEmployeeInfo = async (id, data) => {
  const response = await api.patch(`/employee/${id}`, data);
  return response.data;
};

export const updateWage = async (id, data) => {
  const response = await api.patch(`/employee/${id}/wage`, data);
  return response.data;
};

export const processPayout = async (id, data) => {
  const response = await api.post(`/employee/${id}/payout`, data);
  return response.data;
};

export const fetchEmployeeReport = async (id) => {
  const response = await api.get(`/employee/${id}/report`);
  return response.data.data;
};
