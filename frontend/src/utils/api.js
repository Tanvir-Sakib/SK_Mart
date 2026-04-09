// src/utils/api.js
import axios from "axios";
import defaultImage from "../assets/default-image.svg";

// Get the API URL from environment variables or use localhost for development
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return defaultImage;
  }
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_URL}${cleanPath}`;
};

// Helper function to get API endpoint URL
export const getApiUrl = (endpoint) => {
  return `${API_URL}${endpoint}`;
};

// Define all API endpoints - MAKE SURE THESE ARE STRINGS
export const endpoints = {
  // Auth endpoints
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    updateProfile: '/api/auth/update-profile',
    changePassword: '/api/auth/change-password',
    addresses: {
      getAll: '/api/auth/addresses',
      add: '/api/auth/addresses',
      update: (id) => `/api/auth/addresses/${id}`,
      delete: (id) => `/api/auth/addresses/${id}`,
      setDefault: (id) => `/api/auth/addresses/${id}/default`,
    }
  },
  
  // Product endpoints
  products: {
    getAll: '/api/products',
    getSingle: (id) => `/api/products/${id}`,
    admin: {
      getAll: '/api/admin/products',
      create: '/api/admin/products',
      update: (id) => `/api/admin/products/${id}`,
      delete: (id) => `/api/admin/products/${id}`,
    }
  },
  
  // Category endpoints
  categories: {
    getAll: '/api/categories',
    getSingle: (id) => `/api/categories/${id}`,
    admin: {
      getAll: '/api/admin/categories',
      create: '/api/admin/categories',
      update: (id) => `/api/admin/categories/${id}`,
      delete: (id) => `/api/admin/categories/${id}`,
    }
  },
  
  // Cart endpoints - EACH MUST BE A STRING OR FUNCTION RETURNING STRING
  cart: {
    get: '/api/cart',
    add: '/api/cart',
    update: (productId) => `/api/cart/update/${productId}`,
    remove: (productId) => `/api/cart/remove/${productId}`,
    clear: '/api/cart/clear',
  },
  
  // Order endpoints
  orders: {
    create: '/api/orders',
    myOrders: '/api/orders/my-orders',
    delete: (id) => `/api/orders/${id}`,
    admin: {
      getAll: '/api/admin/orders',
      updateStatus: (id) => `/api/admin/orders/${id}/status`,
    }
  },
    
  // Admin endpoints
  admin: {
    stats: '/api/admin/stats',
    users: {
      getAll: '/api/admin/users',
      updateRole: (id) => `/api/admin/users/${id}/role`,
      delete: (id) => `/api/admin/users/${id}`,
    },
    shippingSettings: {
      get: '/api/admin/shipping-settings',
      update: '/api/admin/shipping-settings',
      addCity: '/api/admin/shipping-settings/city',
      updateCity: (cityId) => `/api/admin/shipping-settings/city/${cityId}`,
      deleteCity: (cityId) => `/api/admin/shipping-settings/city/${cityId}`,
    }
  },
  
  // Upload endpoint
  upload: '/api/upload',
};

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);