import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const getBaseUrl = () => {
  // If running on the live production domain, force the live backend API URL
  if (window.location.hostname === 'election.issschoolpmna.in') {
    return 'https://electionserver.issschoolpmna.in/api';
  }

  const envUrl = import.meta.env.VITE_API_URL;
  // If viewing on a local network IP but the .env hardcodes localhost, force dynamic IP fallback
  if (envUrl && envUrl.includes('localhost') && window.location.hostname !== 'localhost') {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }
  return envUrl || `${window.location.protocol}//${window.location.hostname}:5000/api`;
};

export const getMediaUrl = () => getBaseUrl().replace('/api', '');

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Hardware Binding: Inject persistent device ID for voting terminals
    let deviceId = localStorage.getItem('evm_device_id');
    if (!deviceId) {
      deviceId = `DEV-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      localStorage.setItem('evm_device_id', deviceId);
    }
    config.headers['device-id'] = deviceId;

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
