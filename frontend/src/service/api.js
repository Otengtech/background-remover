import axios from 'axios';
import { toast } from 'react-toastify';
import React from "react"
// Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for image processing
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('removeit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For file uploads, remove Content-Type to let browser set it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling responses
api.interceptors.response.use(
  (response) => {
    // For image responses, return the blob directly
    if (response.headers['content-type']?.includes('image/')) {
      return {
        data: response.data,
        headers: response.headers,
        status: response.status,
        isImageResponse: true
      };
    }
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      const errorData = response.data;
      const errorCode = errorData?.code;
      
      switch (response.status) {
        case 400:
          toast.error(errorData?.error || 'Invalid request. Please check your input.');
          break;
          
        case 401:
          // Clear auth data
          localStorage.removeItem('removeit_token');
          localStorage.removeItem('removeit_user');
          localStorage.removeItem('quota');
          
          toast.error('Session expired. Please login again.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
          break;
          
        case 403:
  if (errorCode === 'QUOTA_EXCEEDED') {
    toast.error(
      React.createElement('div', { className: 'text-center' }, [
        React.createElement('p', { className: 'font-bold', key: 'title' }, 'Monthly Limit Reached!'),
        React.createElement('p', { className: 'text-sm mt-1', key: 'message' }, errorData.error),
        React.createElement('p', { className: 'text-xs mt-2', key: 'usage' }, `Used: ${errorData.current}/${errorData.limit}`),
        React.createElement('button', {
          key: 'button',
          onClick: () => window.location.href = '/pricing',
          className: 'mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium'
        }, 'Upgrade Plan')
      ]),
      { autoClose: 10000 }
    );
  } else {
    toast.error(errorData?.error || 'Access denied.');
  }
  break;
        case 413:
          toast.error('File too large. Maximum size is 20MB.');
          break;
          
        case 422:
          toast.error('Unprocessable image. Please try another image.');
          break;
          
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          toast.error(errorData?.error || 'An error occurred. Please try again.');
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    } else if (error.message === 'Network Error') {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Quota management functions
export const fetchQuota = async () => {
  const response = await api.get('/images/stats');
  if (response.data.success) {
    const data = response.data.data;
    
    // Store quota in localStorage for persistence
    localStorage.setItem('quota', JSON.stringify(data));
    
    // Dispatch custom event for quota updates
    window.dispatchEvent(new CustomEvent('quotaUpdated', { detail: data }));
    
    return data;
  }
  
  // Return cached quota if available when API fails
  const cachedQuota = localStorage.getItem('quota');
  return cachedQuota ? JSON.parse(cachedQuota) : null;
};

// Image processing function
export const processImage = async (formData, onProgress = null) => {
  const response = await api.post('/images/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob',
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
  
  return response;
};

// Process image from URL
export const processImageFromUrl = async (imageUrl) => {
  const response = await api.post('/images/process-url', { image_url: imageUrl }, {
    responseType: 'blob'
  });
  
  return response;
};

// Get quota from local storage (for immediate access)
export const getCachedQuota = () => {
  const cached = localStorage.getItem('quota');
  return cached ? JSON.parse(cached) : null;
};

export default api;