import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
});

// Request interceptor to attach tokens
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.token = token; // Matching backend authuser.js requirement
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;