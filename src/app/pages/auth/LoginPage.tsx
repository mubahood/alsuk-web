// src/app/pages/auth/LoginPage.tsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>("");

  const from = (location.state as any)?.from?.pathname || "/";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear server error when user starts typing
    if (serverError) {
      setServerError("");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 1) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({}); // Clear any previous errors
    setServerError(""); // Clear server error
    
    try {
      // Simplified for testing - just show success
      console.log('Login attempt:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('Login successful (test mode)');
      navigate(from, { replace: true });
    } catch (error: any) {
      // Handle any unexpected errors
      const errorMessage = error?.message || "Login failed. Please try again.";
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="text-center mb-4">
        <h2 className="h3 fw-bold">Sign In</h2>
        <p className="text-muted">Welcome back! Please sign in to your account</p>
      </div>

      {serverError && (
        <Alert variant="danger" className="mb-4">
          {serverError}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            isInvalid={!!errors.email}
            placeholder="Enter your email"
            autoComplete="email"
          />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <div className="d-flex justify-content-between">
            <Form.Label>Password</Form.Label>
            <Link 
              to="/auth/forgot-password" 
              className="small text-decoration-none"
            >
              Forgot password?
            </Link>
          </div>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            isInvalid={!!errors.password}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <Form.Control.Feedback type="invalid">
            {errors.password}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Check
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
            label="Remember me"
          />
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-100 mb-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        <div className="text-center">
          <span className="text-muted">Don't have an account? </span>
          <Link to="/auth/register" className="text-decoration-none fw-semibold">
            Sign up
          </Link>
        </div>

    
      </Form>
    </div>
  );
};

export default LoginPage;
