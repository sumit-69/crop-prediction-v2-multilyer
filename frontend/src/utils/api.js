import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE, timeout: 30000 });

export const getStates = () => api.get('/states').then(r => r.data);
export const getDistricts = (state) => api.get(`/districts/${encodeURIComponent(state)}`).then(r => r.data);
export const predictCrop = (payload) => api.post('/predict', payload).then(r => r.data);
export const predictMultilayer = (payload) => api.post('/predict/multilayer', payload).then(r => r.data);
export const predictStability = (payload) => api.post('/predict/stability', payload).then(r => r.data);
export const predictSeasonal = (payload) => api.post('/predict/seasonal', payload).then(r => r.data);
export const predictRisk = (payload) => api.post('/predict/risk', payload).then(r => r.data);
