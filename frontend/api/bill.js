import api from './client';
import { Platform } from 'react-native';

export const fetchBills = async (queryParams = {}) => {
  const response = await api.get('/bill', { params: queryParams });
  return response.data; // { success, data: { data: [], meta: {} } }
};

export const fetchBillById = async (id) => {
  const response = await api.get(`/bill/${id}`);
  return response.data; // { success, data }
};

export const createBill = async (data) => {
  const response = await api.post('/bill', data);
  return response.data;
};

export const updateBill = async (id, data) => {
  const response = await api.patch(`/bill/${id}`, data);
  return response.data;
};

export const markBillPaid = async (id, data) => {
  // data: { paymentMethod, paymentDate, notes }
  const response = await api.patch(`/bill/${id}/pay`, data);
  return response.data;
};

export const addBillItems = async (id, items) => {
  const response = await api.post(`/bill/${id}/items`, { items });
  return response.data;
};

export const removeBillItems = async (id, itemIds) => {
  const response = await api.delete(`/bill/${id}/items`, { data: { itemIds } });
  return response.data;
};

export const attachBillFile = async (id, attachment) => {
  const response = await api.post(`/bill/${id}/attachments`, attachment);
  return response.data;
};

export const removeBillFile = async (id, attachmentId) => {
  const response = await api.delete(`/bill/${id}/attachments/${attachmentId}`);
  return response.data;
};

// Upload helper for Multer
export const uploadFile = async (imageUri) => {
  const formData = new FormData();
  
  // Extract file name from uri
  const filename = imageUri.split('/').pop();
  
  // Infer the type
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;

  formData.append('file', {
    uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
    name: filename,
    type,
  });

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data; // { success, data: { url, fileType } }
};
