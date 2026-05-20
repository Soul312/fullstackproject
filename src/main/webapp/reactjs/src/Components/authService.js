import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const AUTH_STORAGE_KEY = 'basicAuth';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

const getAuthToken = () => localStorage.getItem(AUTH_STORAGE_KEY);

apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Basic ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default {
  login: (username, password) => {
    const basicToken = btoa(`${username}:${password}`);
    return apiClient
      .get('/voitures', { headers: { Authorization: `Basic ${basicToken}` } })
      .then(() => {
        localStorage.setItem(AUTH_STORAGE_KEY, basicToken);
        return true;
      });
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  isAuthenticated: () => !!getAuthToken(),

  getVoitures: () => {
    return apiClient.get('/voitures');
  },

  getVoiture: (id) => {
    return apiClient.get(`/voitures/${id}`);
  },

  addVoiture: (voiture) => {
    return apiClient.post('/voitures', voiture);
  },

  updateVoiture: (id, voiture) => {
    return apiClient.put(`/voitures/${id}`, voiture);
  },

  deleteVoiture: (id) => {
    return apiClient.delete(`/voitures/${id}`);
  },
};
