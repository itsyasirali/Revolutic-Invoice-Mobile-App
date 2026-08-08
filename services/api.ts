import axios from 'axios';
import { IP } from '@/utils/IP';
import { getStoredToken, clearStoredToken } from '@/utils/authToken';

// Configure axios defaults
axios.defaults.baseURL = IP;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Attach the stored bearer token (if any) to every outgoing request
axios.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);

    // Handle specific error cases
    if (error.response?.status === 404) {
      console.error('404 Error - Route not found:', error.config.url);
    } else if (error.response?.status === 401) {
      console.error('401 Error - Unauthorized');
      await clearStoredToken();
    } else if (error.response?.status === 500) {
      console.error('500 Error - Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default axios;
