import axios from 'axios';


const apiClient = axios.create({
  baseURL: 'http://3.6.40.108:5000/api',
  // baseURL: 'http://192.168.29.126:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-user-id' : '6962456fb8324d04c3c77a95',
  },
});

export default apiClient;
export const SERVER_URL = apiClient.defaults.baseURL.replace('/api', '');

// apiClient.interceptors.request.use(async (config) => {
//   const token = await getToken(); 
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });