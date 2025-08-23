import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('authToken');
      return { success: true };
    } catch (error) {
      console.error('Logout API error:', error);
      // Still remove token locally even if API call fails
      localStorage.removeItem('authToken');
      return { success: true };
    }
  }

  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  // Add these methods to your AuthService class
async verifyMFA(email, code) {
  try {
    const response = await api.post('/auth/verify-mfa', {
      email,
      code,
    });
    return response.data;
  } catch (error) {
    console.error('MFA verification error:', error);
    throw error;
  }
}

async resendMFA(email) {
  try {
    const response = await api.post('/auth/resend-mfa', {
      email,
    });
    return response.data;
  } catch (error) {
    console.error('Resend MFA error:', error);
    throw error;
  }
}
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  getToken() {
    return localStorage.getItem('authToken');
  }
}



export default new AuthService();