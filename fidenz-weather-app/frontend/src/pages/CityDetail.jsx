import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import weatherService from '../services/weatherService';
import bgVideo from '../assets/bg.mp4'; // background video
import './CityDetail.css';

const CityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchCityWeather();
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

  if (loading) return <LoadingSpinner text="Loading city weather..." />;

  if (error) {
    return (
      <div className="city-detail">
        <video autoPlay loop muted playsInline className="bg-video">
          <source src={bgVideo} type="video/mp4" />
        </video>
        <div className="overlay"></div>
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6}>
              <Alert variant="danger" className="glass-card text-center">
                <h4>Error Loading Weather Data</h4>
                <p>{error}</p>
                <Button variant="outline-light" onClick={fetchCityWeather} className="me-2">
                  <RefreshCw size={16} className="me-2" /> Try Again
                </Button>
                <Button variant="light" onClick={() => navigate('/')}>
                  <ArrowLeft size={16} className="me-2" /> Back
                </Button>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (!weatherData) return null;

  const {
    name, country, temperature, tempMin, tempMax,
    description, main, humidity, pressure, visibility,
    windSpeed, windDirection, sunrise, sunset
  } = weatherData;

  const cardColor = weatherService.getWeatherCardColor(main, temperature);
  const formattedDescription = weatherService.formatWeatherDescription(description);
  const windDir = weatherService.formatWindDirection(windDirection);

  return (
    <div className="city-detail">
      {/* Background video */}
      <video autoPlay loop muted playsInline className="bg-video">
        <source src={bgVideo} type="video/mp4" />
      </video>
      <div className="overlay"></div>

      <Container fluid>
        <Row className="justify-content-center">
          <Col xs={12} xl={10}>
            <div className="city-detail-card glass-card" style={{ backgroundColor: cardColor }}>
              {/* Header */}
              <div className="detail-header d-flex justify-content-between align-items-center mb-3">
                <Button variant="link" onClick={() => navigate('/')} className="back-button text-light p-0">
                  <ArrowLeft size={24} />
                </Button>
                <h2 className="city-name">{name}, {country}</h2>
                <Button variant="outline-light" onClick={fetchCityWeather}>
                  <RefreshCw size={16} className="me-2" /> Refresh
                </Button>
              </div>

              {/* Landscape Layout */}
              <div className="landscape-layout">
                {/* Left side: weather icon + temp */}
                <div className="left-panel">
                  <div className="weather-icon-large">
                    {main === 'Clear' && <i className="fas fa-sun"></i>}
                    {main === 'Clouds' && <i className="fas fa-cloud"></i>}
                    {main === 'Rain' && <i className="fas fa-cloud-rain"></i>}
                    {main === 'Snow' && <i className="fas fa-snowflake"></i>}
                    {main === 'Mist' && <i className="fas fa-smog"></i>}
                  </div>
                  <div className="temperature-section">
                    <h1>{temperature}°C</h1>
                    <h4>{formattedDescription}</h4>
                    <p>Min: {tempMin}°C | Max: {tempMax}°C</p>
                  </div>
                </div>

                {/* Right side: weather details */}
                <div className="right-panel">
                  <div className="details-grid">
                    <div className="detail-item"><span>Pressure:</span> {pressure} hPa</div>
                    <div className="detail-item"><span>Humidity:</span> {humidity}%</div>
                    <div className="detail-item"><span>Visibility:</span> {visibility} km</div>
                    <div className="detail-item"><span>Wind:</span> {windSpeed} m/s {windDir}</div>
                    <div className="detail-item"><span>Sunrise:</span> {sunrise}</div>
                    <div className="detail-item"><span>Sunset:</span> {sunset}</div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CityDetail;
