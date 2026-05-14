import api from './client';

export const fetchLowStockAlerts = async () => {
  const response = await api.get('/dashboard/low-stock');
  return response.data.data;
};
