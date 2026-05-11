import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If viewing on a local network IP but the .env hardcodes localhost, force dynamic IP fallback
  if (envUrl && envUrl.includes('localhost') && window.location.hostname !== 'localhost') {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }
  return envUrl || `${window.location.protocol}//${window.location.hostname}:5000/api`;
};

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/terminal')) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
