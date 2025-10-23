import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }

    const error = searchParams.get('error');
    if (error === 'auth_failed') {
      toast.error('Authentication failed. Please try again.');
    } else if (error === 'invalid_domain') {
      toast.error('Only @klh.edu.in email addresses are allowed');
    }
  }, [isAuthenticated, navigate, searchParams]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <span className="logo-icon-large">🔍</span>
            </div>
            <h1>KLH Lost & Found</h1>
            <p className="login-subtitle">
              Secure campus community platform for lost and found items
            </p>
          </div>

          <div className="login-features">
            <div className="feature-item">
              <Check size={20} className="check-icon" />
              <span>Report lost or found items</span>
            </div>
            <div className="feature-item">
              <Check size={20} className="check-icon" />
              <span>Track and claim items</span>
            </div>
            <div className="feature-item">
              <Check size={20} className="check-icon" />
              <span>Real-time notifications</span>
            </div>
            <div className="feature-item">
              <Check size={20} className="check-icon" />
              <span>Secure verification process</span>
            </div>
          </div>

          <div className="login-action">
            <button onClick={login} className="google-login-btn">
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <p className="login-note">
              <Shield size={16} />
              Only @klh.edu.in email addresses are allowed
            </p>
          </div>

          <div className="login-footer">
            <p>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;