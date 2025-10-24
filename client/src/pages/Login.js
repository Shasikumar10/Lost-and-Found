import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import './Login.css';

const Login = () => {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // If already logged in, show message instead of auto-redirect
  if (user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>Already Logged In</h2>
          <p>You are already logged in as {user.name}</p>
          <a href="/" className="google-login-btn">Go to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>KLH Lost & Found</h1>
          <p>Sign in with your KLH email to continue</p>
        </div>

        <button 
          className="google-login-btn" 
          onClick={handleGoogleLogin}
        >
          <FcGoogle className="google-icon" />
          Sign in with Google
        </button>

        <div className="login-footer">
          <p className="text-muted">
            Only @klh.edu.in emails are allowed
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;