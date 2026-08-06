import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.2:8080/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to inject JWT
client.interceptors.request.use(
  async (config) => {
    console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error fetching token from storage:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Network request failed';
    const status = error.response?.status;

    const customError = {
      message: errorMsg,
      status: status || 500,
      data: error.response?.data || null,
    };

    console.warn(`API Error [${customError.status}]: ${customError.message}`);
    return Promise.reject(customError);
  }
);

export default client;
