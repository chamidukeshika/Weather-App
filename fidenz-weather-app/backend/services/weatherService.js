const axios = require("axios");
const NodeCache = require("node-cache");
const cities = require("../data/cities.json");

// Initialize cache with 5-minute TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

class WeatherService {
  constructor() {
    this.apiKey = "c0d1b9323a210c68df9ab74691dbef20";
    this.baseUrl =
      process.env.OPENWEATHER_BASE_URL ||
      "https://api.openweathermap.org/data/2.5";

    if (!this.apiKey) {
      throw new Error("OpenWeatherMap API key is required");
    }
    if (!this.baseUrl) {
      throw new Error("OpenWeatherMap Base URL is required");
    }
  }

  // Function to get background color based on weather condition
  getWeatherCardColor(main, temperature) {
    switch(main) {
      case 'Clear':
        return '#77B0AA'; // Light greenish-blue for clear sky
      case 'Clouds':
        return '#9BBEC8'; // Light blue-gray for clouds
      case 'Rain':
        return '#7DA0CA'; // Soft blue for rain
      case 'Drizzle':
        return '#88A0A8'; // Muted blue for drizzle
      case 'Thunderstorm':
        return '#4A5C6A'; // Dark blue-gray for thunderstorms
      case 'Snow':
        return '#C5D1D9'; // Very light blue for snow
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return '#B4C6DC'; // Light gray-blue for mist/fog/haze
      case 'Smoke':
        return '#A0A9B4'; // Gray for smoke
      case 'Dust':
      case 'Sand':
      case 'Ash':
        return '#D7C9AA'; // Sandy color for dust/sand/ash
      case 'Squall':
        return '#6D8A96'; // Medium blue for squalls
      case 'Tornado':
        return '#5C6672'; // Dark gray for tornado
      default:
        // Temperature-based fallback
        if (temperature > 30) return '#FFB380'; // Warm orange for hot temperatures
        if (temperature < 5) return '#A3C3D9'; // Cool blue for cold temperatures
        return '#9BBEC8'; // Default blue-gray
    }
  }

  // Format weather description
  formatWeatherDescription(description) {
    return description.charAt(0).toUpperCase() + description.slice(1);
  }

  // Format wind direction
  formatWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  // Extract city codes from JSON data
  getCityCodes() {
    try {
      return cities.List.map((city) => city.CityCode);
    } catch (error) {
      console.error("Error reading cities data:", error);
      throw new Error("Failed to load cities data");
    }
  }

  // Fetch weather data for all cities
  async getAllWeatherData() {
    const cacheKey = "all_weather_data";
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const cityCodes = this.getCityCodes();
      const weatherData = [];

      // Fetch data for each city individually (free tier workaround)
      for (const cityId of cityCodes) {
        try {
          const cityWeather = await this.getCityWeatherData(cityId);
          weatherData.push(cityWeather);

          // Add a small delay to avoid rate limiting (1 request per second)
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(
            `Error fetching data for city ${cityId}:`,
            error.message
          );
          // Continue with other cities even if one fails
        }
      }

      cache.set(cacheKey, weatherData);
      return weatherData;
    } catch (error) {
      console.error("Weather API Error:", error.message);
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }

  // Fetch weather data for a specific city
  async getCityWeatherData(cityId) {
    const cacheKey = `weather_${cityId}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          id: cityId,
          units: "metric",
          appid: this.apiKey,
        },
        timeout: 10000,
      });

      const weatherData = this.transformSingleCityData(response.data);
      cache.set(cacheKey, weatherData);
      return weatherData;
    } catch (error) {
      console.error(`Weather API Error for city ${cityId}:`, error.message);

      // Return mock data if API fails
      const mockData = this.getMockWeatherData(cityId);
      if (mockData) {
        return mockData;
      }

      throw new Error(
        `Failed to fetch weather data for city: ${error.message}`
      );
    }
  }

  // Transform API response to match frontend
  transformWeatherData(apiResponse) {
    if (!apiResponse.list) {
      throw new Error("Invalid API response format");
    }
    return apiResponse.list.map((city) => this.transformSingleCityData(city));
  }

  transformSingleCityData(cityData) {
    return {
      id: cityData.id,
      name: cityData.name,
      country: cityData.sys?.country || "",
      temperature: Math.round(cityData.main.temp),
      feelsLike: Math.round(cityData.main.feels_like),
      tempMin: Math.round(cityData.main.temp_min),
      tempMax: Math.round(cityData.main.temp_max),
      description: cityData.weather[0].description,
      main: cityData.weather[0].main,
      icon: cityData.weather[0].icon,
      humidity: cityData.main.humidity,
      pressure: cityData.main.pressure,
      visibility: cityData.visibility
        ? Math.round(cityData.visibility / 1000)
        : null,
      windSpeed: cityData.wind?.speed || 0,
      windDirection: cityData.wind?.deg || 0,
      cloudiness: cityData.clouds?.all || 0,
      sunrise: new Date(cityData.sys.sunrise * 1000).toLocaleTimeString(
        "en-US",
        {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
      sunset: new Date(cityData.sys.sunset * 1000).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      timezone: cityData.timezone,
      lastUpdated: new Date().toISOString(),
    };
  }

  getMockWeatherData(cityId) {
    // Find the city in the cities data
    const city = cities.List.find(c => c.CityCode === parseInt(cityId));
    if (!city) return null;

    // Generate mock weather data based on city and season
    const now = new Date();
    const month = now.getMonth();
    const isSummer = month >= 5 && month <= 7; // June-August
    const isWinter = month >= 11 || month <= 1; // December-February
    
    const weatherConditions = ['Clear', 'Clouds', 'Rain', 'Snow'];
    const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    let temp;
    if (isSummer) {
      temp = Math.floor(Math.random() * 15) + 20; // 20-35°C in summer
    } else if (isWinter) {
      temp = Math.floor(Math.random() * 15) - 5; // -5 to 10°C in winter
    } else {
      temp = Math.floor(Math.random() * 15) + 10; // 10-25°C in spring/fall
    }

    return {
      id: cityId,
      name: city.CityName,
      country: city.Country,
      temperature: temp,
      feelsLike: temp - (Math.random() * 3),
      tempMin: temp - (Math.random() * 5),
      tempMax: temp + (Math.random() * 5),
      description: randomCondition.toLowerCase(),
      main: randomCondition,
      icon: "01d",
      humidity: Math.floor(Math.random() * 50) + 30,
      pressure: Math.floor(Math.random() * 100) + 1000,
      visibility: Math.floor(Math.random() * 10) + 5,
      windSpeed: Math.floor(Math.random() * 20) + 1,
      windDirection: Math.floor(Math.random() * 360),
      cloudiness: Math.floor(Math.random() * 100),
      sunrise: "06:00",
      sunset: "18:00",
      timezone: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  getCacheStats() {
    return {
      keys: cache.keys().length,
      stats: cache.getStats(),
    };
  }

  clearCache() {
    cache.flushAll();
  }
}

module.exports = new WeatherService();