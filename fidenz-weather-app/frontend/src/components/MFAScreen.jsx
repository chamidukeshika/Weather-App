import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "../pages/Login.css";

const MFAScreen = ({ email, onBack }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { verifyMFA, resendMFA } = useAuth();

  useEffect(() => {
    // Start countdown for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    const result = await verifyMFA(email, code);
    setLoading(false);

    if (result && result.success) {
      toast.success("Verified successfully!");
    } else {
      toast.error(result?.error || "Verification failed");
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    const result = await resendMFA(email);
    setResendLoading(false);

    if (result && result.success) {
      toast.success("New code sent to your email");
      setCountdown(60); // Reset countdown
    } else {
      toast.error(result?.error || "Failed to resend code");
    }
  };

  return (
    <Container fluid className="h-100">
      <Row className="h-100 align-items-center justify-content-center">
        <Col xs={11} sm={9} md={6} lg={4} xl={4}>
          <Card className="login-card">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h3 className="login-title">Verify Your Identity</h3>
                <p className="login-subtitle">
                  We've sent a verification code to <strong>{email}</strong>
                </p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="form-label">
                    Verification Code
                  </Form.Label>
                  <div className="input-group-custom">
                    <span className="input-icon">
                      <i className="bi bi-shield-lock"></i>
                    </span>
                    <Form.Control
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="form-input text-center"
                      autoComplete="one-time-code"
                      autoFocus
                    />
                  </div>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="login-button w-100 mb-3"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </span>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Verify
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={handleResendCode}
                    disabled={resendLoading || countdown > 0}
                    className="text-decoration-none"
                  >
                    {resendLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Sending...
                      </>
                    ) : countdown > 0 ? (
                      `Resend code in ${countdown}s`
                    ) : (
                      "Resend verification code"
                    )}
                  </Button>
                </div>
              </Form>

              <div className="text-center mt-4">
                <Button
                  variant="link"
                  onClick={onBack}
                  className="text-decoration-none"
                >
                  <i className="bi bi-arrow-left me-1"></i> Back to login
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MFAScreen;
