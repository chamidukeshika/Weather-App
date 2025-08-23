import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import WeatherDashboard from "./pages/WeatherDashboard";
import CityDetail from "./pages/CityDetail";
import Login from "./pages/Login";
import "./styles/App.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Import video file
import bgVideo from "./assets/bg.mp4";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Background Video */}
          <video autoPlay loop muted playsInline className="bg-video">
            <source src={bgVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Dark Overlay for readability */}
          <div className="bg-overlay"></div>

          {/* App Content */}
          <div className="app-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <WeatherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/city/:id"
                element={
                  <ProtectedRoute>
                    <CityDetail />
                  </ProtectedRoute>
                }
              />

              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
