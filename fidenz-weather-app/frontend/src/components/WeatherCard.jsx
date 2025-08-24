import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import './WeatherCard.css';

const WeatherCard = ({ weatherData, onClose }) => {
  const navigate = useNavigate();

  if (!weatherData) return null;

  const {
    id,
    name,
    country,
    temperature,
    tempMin,
    tempMax,
    description,
    main,
    humidity,
    pressure,
    visibility,
    windSpeed,
    windDirection,
    sunrise,
    sunset
  } = weatherData;

  // Function to get background color based on weather condition
  const getWeatherCardColor = (main, temperature) => {
    switch(main) {
      case 'Clear':
        return '#4A90E2'; // Medium blue for clear sky
      case 'Clouds':
        if (description.includes('few') || description.includes('scattered')) {
          return '#5D8CAE'; // Medium blue-gray for partly cloudy
        }
        return '#6B7A8F'; // Darker blue-gray for overcast
      case 'Rain':
        return '#3F6B8F'; // Deep blue for rain
      case 'Drizzle':
        return '#5A7D9A'; // Medium blue for drizzle
      case 'Thunderstorm':
        return '#2C3E50'; // Very dark blue for thunderstorms
      case 'Snow':
        return '#7B8B9A'; // Light gray-blue for snow
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return '#7D8E9E'; // Medium gray-blue for mist/fog/haze
      case 'Smoke':
        return '#6D7B88'; // Gray for smoke
      case 'Dust':
      case 'Sand':
      case 'Ash':
        return '#9D8A6B'; // Muted sandy color for dust/sand/ash
      case 'Squall':
        return '#4A6572'; // Dark blue-gray for squalls
      case 'Tornado':
        return '#4A5568'; // Very dark gray-blue for tornado
      default:
        if (temperature > 30) return '#BF5A36'; // Muted terracotta for hot temperatures
        if (temperature < 5) return '#4A77A3'; // Cool blue for cold temperatures
        return '#5D8CAE'; // Default blue-gray
    }
  };

  // Format weather description
  const formatWeatherDescription = (description) => {
    return description.charAt(0).toUpperCase() + description.slice(1);
  };

  // Format wind direction
  const formatWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const cardColor = getWeatherCardColor(main, temperature);
  const formattedDescription = formatWeatherDescription(description);
  const windDir = formatWindDirection(windDirection);

  const handleCardClick = () => {
    navigate(`/city/${id}`);
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div 
      className="weather-card" 
      style={{ backgroundColor: cardColor }}
      onClick={handleCardClick}
    >
      {/* Background weather icon based on condition */}
      <div className={`card-bg-icon ${main.toLowerCase()}`}></div>
      
      {/* Close button - fixed to top right corner */}
      <button 
        className="weather-card-close"
        onClick={handleCloseClick}
        aria-label="Close"
      >
        <X size={16} />
      </button>

      {/* Header */}
      <div className="weather-card-header">
        <div className="city-info">
          <h3 className="city-name">{name}, {country}</h3>
          <p className="current-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date().toLocaleDateString()}</p>
        </div>
        <div className="temperature-main">
          <span className="temp-value">{temperature}°</span>
          <span className="temp-unit">C</span>
        </div>
      </div>

      {/* Weather condition */}
      <div className="weather-condition">
        <div className="weather-icon">
          {main === 'Clear' && <i className="fas fa-sun"></i>}
          {main === 'Clouds' && <i className="fas fa-cloud"></i>}
          {main === 'Rain' && <i className="fas fa-cloud-rain"></i>}
          {main === 'Drizzle' && <i className="fas fa-cloud-drizzle"></i>}
          {main === 'Thunderstorm' && <i className="fas fa-bolt"></i>}
          {main === 'Snow' && <i className="fas fa-snowflake"></i>}
          {main === 'Mist' && <i className="fas fa-smog"></i>}
          {main === 'Smoke' && <i className="fas fa-smog"></i>}
          {main === 'Haze' && <i className="fas fa-smog"></i>}
          {main === 'Dust' && <i className="fas fa-wind"></i>}
          {main === 'Fog' && <i className="fas fa-smog"></i>}
          {main === 'Sand' && <i className="fas fa-wind"></i>}
          {main === 'Ash' && <i className="fas fa-wind"></i>}
          {main === 'Squall' && <i className="fas fa-wind"></i>}
          {main === 'Tornado' && <i className="fas fa-tornado"></i>}
          {!['Clear', 'Clouds', 'Rain', 'Drizzle', 'Thunderstorm', 'Snow', 'Mist', 'Smoke', 'Haze', 'Dust', 'Fog', 'Sand', 'Ash', 'Squall', 'Tornado'].includes(main) && <i className="fas fa-cloud"></i>}
        </div>
        <span className="weather-description">{formattedDescription}</span>
        <div className="temp-range">
          <span>Min: {tempMin}°C</span>
          <span>Max: {tempMax}°C</span>
        </div>
      </div>

      {/* Weather details */}
      <div className="weather-details">
        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">Pressure:</span>
            <span className="detail-value">{pressure}hPa</span>
          </div>
          <div className="detail-item wind-info">
            <div className="wind-icon">
              <i className="fas fa-location-arrow" 
                 style={{ transform: `rotate(${windDirection}deg)` }}>
              </i>
            </div>
            <div className="wind-details">
              <span>{windSpeed}m/s {windDir}</span>
            </div>
          </div>
          <div className="detail-item">
            <span className="detail-label">Sunrise:</span>
            <span className="detail-value">{sunrise}</span>
          </div>
        </div>
        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">Humidity:</span>
            <span className="detail-value">{humidity}%</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Visibility:</span>
            <span className="detail-value">{visibility || 8.0}km</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Sunset:</span>
            <span className="detail-value">{sunset}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;