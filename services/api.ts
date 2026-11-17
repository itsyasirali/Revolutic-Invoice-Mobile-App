import axios from 'axios';
import { IP } from '@/utils/IP';
import { getStoredToken, clearStoredToken } from '@/utils/authToken';
import { getStoredActiveOrgId, clearStoredActiveOrgId } from '@/utils/activeOrg';

// Configure axios defaults
axios.defaults.baseURL = IP;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// --- GET de-duplication -------------------------------------------------
// Many screens/hooks mount at once (e.g. the dashboard) and each asks for the
// same endpoint. Identical GETs share one in-flight request, and a very short
// cache absorbs hooks that mount a moment later. Any write clears the cache.
const GET_CACHE_MS = 3000;
const inflight = new Map<string, Promise<any>>();
const recent = new Map<string, { at: number; response: any }>();
const baseAdapter = axios.getAdapter(axios.defaults.adapter);

const requestKey = (config: any) =>
  JSON.stringify([
    config.baseURL,
    config.url,
    config.params ?? null,
    config.headers?.['x-organization-id'] ?? null,
    config.headers?.Authorization ?? null,
  ]);

axios.defaults.adapter = async (config: any) => {
  if ((config.method || 'get').toLowerCase() !== 'get') {
    recent.clear();
    console.log('Making request to:', config.url);
    return baseAdapter(config);
  }
  const key = requestKey(config);
  const hit = recent.get(key);
  if (hit && Date.now() - hit.at < GET_CACHE_MS) return hit.response;
  const pending = inflight.get(key);
  if (pending) return pending;

  console.log('Making request to:', config.url);
  const promise = baseAdapter(config)
    .then((response: any) => {
      recent.set(key, { at: Date.now(), response });
      return response;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
};

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
