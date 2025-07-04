import axios from 'axios';

// Define the environment variables interface for TypeScript
declare interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

// Create an axios instance with the base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Add a request interceptor to handle authentication
api.interceptors.request.use((config) => {
  // Get token from the stored user object
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (error) {
      console.error('Error parsing stored user in API interceptor:', error);
    }
  }
  return config;
});

export default api;
