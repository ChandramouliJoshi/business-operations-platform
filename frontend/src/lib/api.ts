
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach the JWT to authenticated API requests.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('nexora_access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// A rejected token must end the client session as well as the API request.
// AuthContext listens for this event so protected routes cannot remain visible.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('nexora_access_token');
      window.dispatchEvent(new Event('nexora:session-expired'));
    }
    return Promise.reject(error);
  },
);

export default api;
