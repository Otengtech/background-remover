import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for large images
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Process single image
export const processImage = async (formData) => {
  const response = await api.post('/process-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`Upload progress: ${percentCompleted}%`);
    },
  });
  return response.data;
};

// Process multiple images
export const processBatchImages = async (files) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append('images', file);
  });

  const response = await api.post('/batch-process', formData);
  return response.data;
};

// Get server stats
export const getServerStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

// Health check
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Server is not responding');
  }
};

// Download processed image
export const downloadImage = async (filename) => {
  const response = await api.get(`/results/${filename}`, {
    responseType: 'blob',
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api;