/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import authService from "../services/authService.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const userData = await authService.verifyToken(token);
        setUser(userData.user);
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setUser(null);
        setError(data.error || "Login failed");
        setLoading(false);
        return { success: false, error: data.error || "Login failed" };
      }

      // Check if MFA is required
      if (data.requiresMFA) {
        setLoading(false);
        return {
          success: true,
          requiresMFA: true,
          message: data.message,
        };
      }

      // Regular login (no MFA)
      localStorage.setItem("authToken", data.token);
      setUser(data.user);
      setError("");
      setLoading(false);
      return { success: true };
    } catch (err) {
      setUser(null);
      setError("Network error — please try again.");
      setLoading(false);
      return { success: false, error: "Network error — please try again." };
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setError("");
  };

  const clearError = () => {
    setError("");
  };

  // Add these methods to your AuthProvider
  const verifyMFA = async (email, code) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-mfa",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verification failed");
        setLoading(false);
        return { success: false, error: data.error || "Verification failed" };
      }

      // Save token and set user
      localStorage.setItem("authToken", data.token);
      setUser(data.user);
      setError("");
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError("Network error — please try again.");
      setLoading(false);
      return { success: false, error: "Network error — please try again." };
    }
  };

  const resendMFA = async (email) => {
    setError("");
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/resend-mfa",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to resend code");
        return { success: false, error: data.error || "Failed to resend code" };
      }

      setError("");
      return { success: true, message: data.message };
    } catch (err) {
      setError("Network error — please try again.");
      return { success: false, error: "Network error — please try again." };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
    verifyMFA,
    resendMFA,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
