import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', 
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default {
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
