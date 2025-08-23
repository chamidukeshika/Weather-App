import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Dropdown,
} from "react-bootstrap";
import { Search, User, LogOut, RefreshCw, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import WeatherCard from "../components/WeatherCard";
import LoadingSpinner from "../components/LoadingSpinner";
import weatherService from "../services/weatherService";
import "./WeatherDashboard.css";
import logo from "../assets/logo.png";
import bgVideo from "../assets/bg.mp4";

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const { user, logout } = useAuth();
  const videoRef = useRef(null);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  useEffect(() => {
    // Try to play the video with muted autoplay
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("Autoplay prevented:", error);
      });
    }
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await weatherService.getAllCitiesWeather();

      if (response.success) {
        setWeatherData(response.data);
        setLastUpdated(new Date());
      } else {
        setError("Failed to fetch weather data");
      }
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError(err.message || "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchWeatherData();
  };

  const handleLogout = () => {
    logout();
  };

  const handleAddCity = () => {
    // Placeholder for add city functionality
    console.log("Add city button clicked");
  };

  const filteredWeatherData = weatherData.filter(
    (city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner text="Loading weather data..." />;
  }

  return (
    <div className="weather-dashboard">
      {/* Video Background */}
      <div className="video-background">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="background-video"
        >
          <source src={bgVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay"></div>
      </div>

      {/* Header */}
      <div className="dashboard-header">
        <Container fluid>
          <Row className="align-items-center">
            {/* Logo and Title */}
            <Col xs={6} className="logo-section d-flex align-items-center">
              <div className="weather-logo me-2">
                <img src={logo} alt="Weather App Logo" className="logo-image" />
              </div>
              <h1 className="app-title mb-0">Weather App</h1>
            </Col>

            {/* User Menu */}
            <Col
              xs={6}
              className="user-section d-flex align-items-center justify-content-end"
            >
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="outline-light"
                  className="user-dropdown d-flex align-items-center"
                >
                  {/* Full text on large screens, icon only on mobile */}
                  <User size={18} className="me-2" />
                  <span className="user-text">{user?.name || user?.email}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleRefresh}>
                    <RefreshCw size={16} className="me-2" />
                    Refresh Data
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <LogOut size={16} className="me-2" />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>

          {/* Search and Add City section */}
          <Row className="align-items-center mt-3">
            <Col>
              <div className="header-content d-flex align-items-center justify-content-between">
                {/* Search Bar and Add City Button - Centered */}
                <div className="search-add-container d-flex align-items-center justify-content-center flex-grow-1">
                  <div className="search-section mx-3">
                    <div className="search-container">
                      <div className="search-input-container">
                        {/* Show icon only if input is empty */}
                        {searchTerm === "" && (
                          <Search
                            size={20}
                            className="search-icon absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                        )}
                        <Form.Control
                          type="text"
                          placeholder="&nbsp; &nbsp; &nbsp; Search by city or country..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="search-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add City Button */}
                  <div className="add-city-section">
                    <Button
                      variant="outline-light"
                      className="add-city-btn"
                      onClick={handleAddCity}
                    >
                      <Plus size={16} className="me-2" />
                      Add City
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <Container fluid>
          {/* Status Bar */}
          {lastUpdated && (
            <Row className="mb-3">
              <Col>
                <div className="status-bar text-center">
                  <small className="text-light">
                    Last updated: {lastUpdated.toLocaleTimeString()} | Showing{" "}
                    {filteredWeatherData.length} cities
                    {searchTerm && ` (filtered by "${searchTerm}")`}
                  </small>
                </div>
              </Col>
            </Row>
          )}

          {/* Error Alert */}
          {error && (
            <Row className="mb-3">
              <Col>
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              </Col>
            </Row>
          )}

          {/* Weather Cards Grid */}
          <Row className="weather-grid">
            {filteredWeatherData.length > 0 ? (
              filteredWeatherData.map((cityWeather) => (
                <Col
                  key={cityWeather.id}
                  xs={12}
                  sm={6}
                  lg={4}
                  xl={3}
                  className="mb-4"
                >
                  <WeatherCard
                    weatherData={cityWeather}
                    onClose={() => {
                      // Optional: Add functionality to remove city from view
                      console.log("Close city:", cityWeather.name);
                    }}
                  />
                </Col>
              ))
            ) : (
              <Col xs={12}>
                <div className="no-results text-center py-5">
                  <div className="no-results-icon mb-3">🔍</div>
                  <h4 className="text-light">No cities found</h4>
                  <p className="text-light opacity-75">
                    {searchTerm
                      ? `No cities match "${searchTerm}"`
                      : "No weather data available"}
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline-light"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              </Col>
            )}
          </Row>

          {/* Footer */}
          <Row className="mt-5">
            <Col>
              <div className="dashboard-footer text-center">
                <p className="text-light opacity-50 mb-0">
                  2025 Fidenz Technologies
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default WeatherDashboard;
