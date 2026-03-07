import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('dfsp_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status == 401) {
      setTimeout(() => {
        localStorage.removeItem('dfsp_token');
        localStorage.removeItem('dfsp_user');
        window.location.href = '/login';
      }, 2000);
    }
    return Promise.reject(err);
  },
);

export default api;
