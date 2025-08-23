import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Dropdown,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import logo from "../assets/logo.png";
import bgVideo from "../assets/bg.mp4"; // Import your video here
import "./Login.css";
import { toast } from "react-toastify";
import MFAScreen from "../components/MFAScreen";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showCredDropdown, setShowCredDropdown] = useState(false);
  const { login, loading, error, clearError, isAuthenticated } = useAuth();
  const [mfaEmail, setMfaEmail] = useState("");
  const [showMFA, setShowMFA] = useState(false);

  const redirectPath = "/dashboard";

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email format is invalid");
      isValid = false;
    }
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    if (!validateForm()) return;

    const result = await login(email, password);

    if (result && result.success) {
      if (result.requiresMFA) {
        setMfaEmail(email);
        setShowMFA(true);
        toast.info("Verification code sent to your email");
      } else {
        toast.success("Login successfully!");
      }
    } else {
      toast.error(result?.error || "Login failed !!!");
    }
  };

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleInputChange = (setter, errorSetter) => (e) => {
    setter(e.target.value);
    if (error) clearError();
    if (errorSetter) errorSetter("");
  };

  if (loading) {
    return <LoadingSpinner text="Authenticating..." />;
  }

  if (showMFA) {
  return (
    <div className="login-page">
      <video autoPlay loop muted playsInline className="bg-video">
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <MFAScreen 
        email={mfaEmail} 
        onBack={() => {
          setShowMFA(false);
          setMfaEmail('');
        }} 
      />
    </div>
  );
}

  return (
    <div className="login-page">
      {/* Video Background */}
      <video autoPlay loop muted playsInline className="bg-video">
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content */}
      <Container fluid className="h-100">
        <Row className="h-100 align-items-center justify-content-center">
          <Col xs={11} sm={9} md={6} lg={4} xl={4}>
            <Card className="login-card">
              <Card.Body className="p-4">
                {/* Header */}
                <div className="text-center mb-3 d-flex align-items-center justify-content-center gap-2 login-header">
                  <img
                    src={logo}
                    alt="Weather App Logo"
                    className="login-logo me-2"
                  />
                  <h2 className="login-title mb-0">
                    Weather <span className="brand-accent">App</span>
                  </h2>
                </div>
                <div className="login-subtitle text-center mb-3">
                  Welcome back! Please sign in to continue.
                </div>
                {/* Test Credentials Dropdown */}
                <Dropdown
                  show={showCredDropdown}
                  onToggle={setShowCredDropdown}
                  className="mb-3 w-100"
                >
                  <Dropdown.Toggle
                    variant="outline-primary"
                    className="w-100 test-creds-toggle"
                  >
                    Show Test Credentials
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="w-100 p-3 test-creds-dropdown">
                    <div>
                      <div className="fw-bold mb-2">Test Credentials</div>
                      <div className="small mb-1">
                        <span className="text-muted">Email:</span>{" "}
                        careers@fidenz.com
                      </div>
                      <div className="small">
                        <span className="text-muted">Password:</span>{" "}
                        Pass#fidenz
                      </div>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
                {/* Error Alert for validation (not for "Invalid credentials"!) */}
                {error && error !== "Invalid credentials" && (
                  <Alert
                    variant="danger"
                    className="mb-3 custom-alert"
                    dismissible
                    onClose={clearError}
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      <span>{error}</span>
                    </div>
                  </Alert>
                )}
                {/* Login Form */}
                <Form onSubmit={handleSubmit} noValidate>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">
                      Email Address
                    </Form.Label>
                    <div className="input-group-custom">
                      <span className="input-icon">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={handleInputChange(setEmail, setEmailError)}
                        isInvalid={!!emailError}
                        className="form-input"
                        autoComplete="email"
                      />
                    </div>
                    {emailError && (
                      <div className="text-danger small mt-1 error-message">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {emailError}
                      </div>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="form-label">Password</Form.Label>
                    <div className="input-group-custom">
                      <span className="input-icon">
                        <i className="bi bi-lock"></i>
                      </span>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={handleInputChange(
                          setPassword,
                          setPasswordError
                        )}
                        isInvalid={!!passwordError}
                        className="form-input"
                        autoComplete="current-password"
                      />
                      <Button
                        variant="link"
                        className="password-toggle"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <i
                          className={`bi ${
                            showPassword ? "bi-eye-slash" : "bi-eye"
                          }`}
                        ></i>
                      </Button>
                    </div>
                    {passwordError && (
                      <div className="text-danger small mt-1 error-message">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {passwordError}
                      </div>
                    )}
                  </Form.Group>
                  <Button
                    variant="primary"
                    type="submit"
                    className="login-button w-100"
                    disabled={loading || !email || !password}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Sign In
                      </>
                    )}
                  </Button>
                </Form>
                {/* Footer */}
                <div className="login-footer text-center mt-4 pt-3">
                  <small className="text-muted">
                    Fidenz Technologies • Weather App
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
