import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import weatherService from '../services/weatherService';
import './CityDetail.css';

const CityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchCityWeather();
    }
  }, [id]);

  const fetchCityWeather = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await weatherService.getCityWeather(id);
      
      if (response.success) {
        setWeatherData(response.data);
      } else {
        setError('Failed to fetch city weather data');
      }
    } catch (err) {
      console.error('Error fetching city weather:', err);
      setError(err.message || 'Failed to fetch city weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    fetchCityWeather();
  };

  if (loading) {
    return <LoadingSpinner text="Loading city weather..." />;
  }

  if (error) {
    return (
      <div className="city-detail-error">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6}>
              <Alert variant="danger" className="text-center">
                <h4>Error Loading Weather Data</h4>
                <p>{error}</p>
                <div className="mt-3">
                  <Button variant="outline-danger" onClick={handleRefresh} className="me-2">
                    <RefreshCw size={16} className="me-2" />
                    Try Again
                  </Button>
                  <Button variant="primary" onClick={handleBack}>
                    <ArrowLeft size={16} className="me-2" />
                    Back to Dashboard
                  </Button>
                </div>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="city-detail-error">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6}>
              <Alert variant="warning" className="text-center">
                <h4>City Not Found</h4>
                <p>The requested city weather data could not be found.</p>
                <Button variant="primary" onClick={handleBack}>
                  <ArrowLeft size={16} className="me-2" />
                  Back to Dashboard
                </Button>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  const {
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

  const cardColor = weatherService.getWeatherCardColor(main, temperature);
  const formattedDescription = weatherService.formatWeatherDescription(description);
  const windDir = weatherService.formatWindDirection(windDirection);

  return (
    <div className="city-detail">
      <Container fluid>
        <Row className="justify-content-center">
          <Col xs={12} lg={8} xl={6}>
            {/* Back Button */}
            <div className="detail-header mb-4">
              <Button 
                variant="link" 
                onClick={handleBack}
                className="back-button text-light p-0"
              >
                <ArrowLeft size={24} />
              </Button>
            </div>

            {/* Weather Detail Card */}
            <div 
              className="city-detail-card"
              style={{ backgroundColor: cardColor }}
            >
              {/* Header Section */}
              <div className="detail-card-header">
                <div className="city-info">
                  <h1 className="city-name">{name}, {country}</h1>
                  <p className="current-time">9:19am, Feb 8</p>
                </div>
              </div>

              {/* Main Weather Display */}
              <div className="main-weather-display">
                <div className="weather-icon-large">
                  {main === 'Clear' && <i className="fas fa-sun"></i>}
                  {main === 'Clouds' && <i className="fas fa-cloud"></i>}
                  {main === 'Rain' && <i className="fas fa-cloud-rain"></i>}
                  {main === 'Snow' && <i className="fas fa-snowflake"></i>}
                  {main === 'Mist' && <i className="fas fa-smog"></i>}
                  {!['Clear', 'Clouds', 'Rain', 'Snow', 'Mist'].includes(main) && <i className="fas fa-cloud"></i>}
                </div>
                
                <div className="temperature-section">
                  <div className="main-temperature">
                    <span className="temp-value">{temperature}°</span>
                    <span className="temp-unit">C</span>
                  </div>
                  
                  <div className="weather-description">
                    <h2>{formattedDescription}</h2>
                  </div>
                  
                  <div className="temp-range-detail">
                    <span>Temp Min: {tempMin}°C</span>
                    <span className="separator">|</span>
                    <span>Temp Max: {tempMax}°C</span>
                  </div>
                </div>
              </div>

              {/* Detailed Weather Information */}
              <div className="weather-details-section">
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Pressure:</span>
                    <span className="detail-value">{pressure}hPa</span>
                  </div>
                  
                  <div className="detail-item wind-detail">
                    <div className="wind-display">
                      <div className="wind-icon">
                        <i className="fas fa-location-arrow" 
                           style={{ transform: `rotate(${windDirection}deg)` }}>
                        </i>
                      </div>
                      <div className="wind-info">
                        <span className="wind-speed">{windSpeed}m/s {windDir}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Sunrise:</span>
                    <span className="detail-value">{sunrise}</span>
                  </div>
                  
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

              {/* Action Buttons */}
              <div className="detail-actions">
                <Button 
                  variant="outline-light" 
                  onClick={handleRefresh}
                  className="refresh-button"
                >
                  <RefreshCw size={16} className="me-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Footer */}
        <Row className="mt-5">
          <Col>
            <div className="detail-footer text-center">
              <p className="text-light opacity-50 mb-0">
                2021 Fidenz Technologies
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CityDetail;