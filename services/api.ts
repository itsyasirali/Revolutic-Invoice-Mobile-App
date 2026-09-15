import axios from 'axios';
import { IP } from '@/utils/IP';
import { getStoredToken, clearStoredToken } from '@/utils/authToken';
import { getStoredActiveOrgId, clearStoredActiveOrgId } from '@/utils/activeOrg';

// Configure axios defaults
axios.defaults.baseURL = IP;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Attach the stored bearer token (if any) and active organization ID to every outgoing request
axios.interceptors.request.use(
  async (config) => {
    const [token, orgId] = await Promise.all([
      getStoredToken(),
      getStoredActiveOrgId(),
    ]);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (orgId) {
      config.headers['x-organization-id'] = orgId;
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
    if (error.response?.status === 401) {
      await Promise.all([clearStoredToken(), clearStoredActiveOrgId()]);
    } else {
      console.error('Response error:', error.response?.status, error.response?.data);

      if (error.response?.status === 404) {
        console.error('404 Error - Route not found:', error.config.url);
      } else if (error.response?.status === 500) {
        console.error('500 Error - Server error:', error.response.data);
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
