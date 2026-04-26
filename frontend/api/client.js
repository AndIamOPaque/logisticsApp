import axios from 'axios';


const apiClient = axios.create({
  baseURL: 'http://10.16.1.20:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-user-id' : '6962456fb8324d04c3c77a95',
  },
});

export default apiClient;

// apiClient.interceptors.request.use(async (config) => {
//   const token = await getToken(); 
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });