import axios from 'axios';
import { IP } from '@/utils/IP';

// Configure axios defaults
axios.defaults.baseURL = IP;
axios.defaults.withCredentials = true; // This is crucial for sending cookies
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
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
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.error('404 Error - Route not found:', error.config.url);
    } else if (error.response?.status === 401) {
      console.error('401 Error - Unauthorized');
    } else if (error.response?.status === 500) {
      console.error('500 Error - Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default axios;
