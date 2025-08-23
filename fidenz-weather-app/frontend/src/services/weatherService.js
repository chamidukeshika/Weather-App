import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
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

// Response interceptor to handle errors
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

class WeatherService {
  async getAllCitiesWeather() {
    try {
      const response = await api.get('/weather/cities');
      return response.data;
    } catch (error) {
      console.error('Get all cities weather error:', error);
      throw this.handleError(error);
    }
  }

  async getCityWeather(cityId) {
    try {
      const response = await api.get(`/weather/city/${cityId}`);
      return response.data;
    } catch (error) {
      console.error(`Get city ${cityId} weather error:`, error);
      throw this.handleError(error);
    }
  }

  async getCityCodes() {
    try {
      const response = await api.get('/weather/cities/codes');
      return response.data;
    } catch (error) {
      console.error('Get city codes error:', error);
      throw this.handleError(error);
    }
  }

  async getCacheStats() {
    try {
      const response = await api.get('/weather/cache/stats');
      return response.data;
    } catch (error) {
      console.error('Get cache stats error:', error);
      throw this.handleError(error);
    }
  }

  async clearCache() {
    try {
      const response = await api.delete('/weather/cache');
      return response.data;
    } catch (error) {
      console.error('Clear cache error:', error);
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return new Error(error.response.data.message || error.response.data.error || 'API request failed');
    } else if (error.request) {
      // Network error
      return new Error('Network error - please check your connection');
    } else {
      // Something else happened
      return new Error('An unexpected error occurred');
    }
  }

  // Helper function to get weather icon URL
  getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  // Helper function to format temperature
  formatTemperature(temp) {
    return Math.round(temp);
  }

  // Helper function to get weather background color
  getWeatherCardColor(weatherMain, temperature) {
    const temp = parseInt(temperature);
    
    switch (weatherMain?.toLowerCase()) {
      case 'clear':
        return temp > 25 ? '#4FC3F7' : '#81C784'; // Light blue for hot, light green for mild
      case 'clouds':
        return '#9E9E9E'; // Grey
      case 'rain':
      case 'drizzle':
        return '#42A5F5'; // Blue
      case 'snow':
        return '#E1F5FE'; // Light cyan
      case 'mist':
      case 'fog':
        return '#B71C1C'; // Red/brown
      case 'thunderstorm':
        return '#37474F'; // Dark grey
      default:
        return '#2196F3'; // Default blue
    }
  }

  // Helper function to get country flag
  getCountryFlag(countryCode) {
    if (!countryCode) return '';
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
  }

  // Helper function to format wind direction
  formatWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  // Helper function to get weather description with proper formatting
  formatWeatherDescription(description) {
    return description
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

export default new WeatherService();