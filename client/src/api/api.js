import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data) => api.put('/auth/profile', data),
  loginWithGoogle: () => {
    window.location.href = `${API_URL}/auth/google`;
  }
};

// Items API
export const itemsAPI = {
  getItems: (params) => api.get('/items', { params }),
  getItem: (id) => api.get(`/items/${id}`),
  createItem: (formData) => api.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyItems: () => api.get('/items/my/items'),
  updateItem: (id, formData) => api.put(`/items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteItem: (id) => api.delete(`/items/${id}`)
};

// Claims API
export const claimsAPI = {
  createClaim: (formData) => api.post('/claims', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getClaimsByItem: (itemId) => api.get(`/claims/item/${itemId}`),
  getMyClaims: () => api.get('/claims/my'),
  updateClaimStatus: (id, data) => api.put(`/claims/${id}/status`, data),
  deleteClaim: (id) => api.delete(`/claims/${id}`)
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  getAllClaims: (status) => api.get('/admin/claims', { params: { status } }),
  disputeClaim: (id, reviewNote) => api.put(`/admin/claims/${id}/dispute`, { reviewNote }),
  deleteItem: (id) => api.delete(`/admin/items/${id}`)
};

export default api;