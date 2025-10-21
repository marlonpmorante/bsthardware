import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './AuthForm.css';

const AuthForm = ({ setCurrentPage, setIsAuthenticated, setUserRole, setCart, setParentError }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Changed to false for default hidden
  const [consent, setConsent] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const termsModalRef = useRef(null);

  // Handle Escape key to close terms modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showTerms) {
        setShowTerms(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showTerms]);

  // Focus management for accessibility
  useEffect(() => {
    if (showTerms && termsModalRef.current) {
      termsModalRef.current.focus();
    }
  }, [showTerms]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const getPasswordFeedback = () => {
    if (password.length === 0) return null;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const hasMinLength = password.length >= 8;

    if (!hasMinLength) return { valid: false, message: 'Password must be at least 8 characters long' };
    if (!hasUpper) return { valid: false, message: 'Password must contain at least one uppercase letter' };
    if (!hasLower) return { valid: false, message: 'Password must contain at least one lowercase letter' };
    if (!hasNumber) return { valid: false, message: 'Password must contain at least one number' };
    if (!hasSpecial) return { valid: false, message: 'Password must contain at least one special character (e.g., !@#$%^&*)' };
    return { valid: true, message: 'Password meets all requirements' };
  };

  const feedback = getPasswordFeedback();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = 'http://localhost:5000'; // Ensure this matches your backend
      if (!isLogin) {
        if (!email) {
          setError('Email is required for signup');
          setLoading(false);
          return;
        }

        if (!validatePassword(password)) {
          setError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character');
          setLoading(false);
          return;
        }

        if (!consent) {
          setError('You must agree to the Terms and Conditions and Privacy Policy');
          setLoading(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ username, email, password, consent }),
        });

        const text = await response.text(); // Get raw response for debugging
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error('Non-JSON response:', text);
          throw new Error('Server returned an unexpected response. Please check the server.');
        }

        if (response.ok) {
          setError('Sign Up successful! Please log in.');
          setIsLogin(true);
          setUsername('');
          setPassword('');
          setEmail('');
          setConsent(false);
          setShowPassword(false);
        } else {
          setError(data.error || 'Signup failed');
        }
      } else {
        // Try user login with email or username
        let response = await fetch(`${apiUrl}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email: username.includes('@') ? username : undefined, username: username.includes('@') ? undefined : username, password }),
        });

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error('Non-JSON response:', text);
          throw new Error('Server returned an unexpected response. Please check the server.');
        }

        if (response.ok) {
          console.log('User login successful, token:', data.token);
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', 'user');
          setIsAuthenticated(true);
          setUserRole('user');
          const cartResponse = await fetch(`${apiUrl}/api/cart`, {
            headers: { Authorization: `Bearer ${data.token}`, 'Accept': 'application/json' },
          });
          if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            console.log('Cart fetched after login:', cartData);
            setCart(cartData);
          } else {
            const cartText = await cartResponse.text();
            console.error('Failed to fetch cart, response:', cartText);
            setParentError('Failed to load cart.');
          }
          setCurrentPage('products');
          setUsername('');
          setPassword('');
          setEmail('');
          setShowPassword(false);
        } else {
          // Try admin login
          response = await fetch(`${apiUrl}/api/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          const adminText = await response.text();
          try {
            data = JSON.parse(adminText);
          } catch {
            console.error('Non-JSON response:', adminText);
            throw new Error('Server returned an unexpected response. Please check the server.');
          }

          if (response.ok) {
            console.log('Admin login successful, token:', data.token);
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', 'admin');
            setIsAuthenticated(true);
            setUserRole('admin');
            setCurrentPage('adminDashboard');
            setUsername('');
            setPassword('');
            setEmail('');
            setShowPassword(false);
          } else {
            setError(data.error || 'Authentication failed');
          }
        }
      }
    } catch (err) {
      console.error('Auth error:', err.message);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setPassword('');
    setEmail('');
    setConsent(false);
    setShowPassword(false);
  };

  const TermsAndConditions = () => (
    <div className="terms-overlay" ref={termsModalRef} tabIndex={-1}>
      <div className="terms-content">
        <h3>Terms and Conditions and Privacy Policy</h3>
        <p><strong>Last Updated: September 13, 2025</strong></p>
        <p>Welcome to BST Hardware Online System. By using our platform, you agree to these Terms and Conditions and Privacy Policy. Please read them carefully.</p>

        <h4>1. Data Collection</h4>
        <p>We collect personal information such as your username, email, and hashed password to provide services like account management and order processing. This data is stored securely in our MySQL database.</p>

        <h4>2. Data Security</h4>
        <p>Passwords are hashed using bcrypt before storage. During signup, passwords must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character (e.g., !@#$%^&*).</p>

        <h4>3. User Responsibilities</h4>
        <p>You are responsible for keeping your login credentials confidential. Do not share your username, email, or password. BST Hardware is not liable for unauthorized access due to failure to secure your account.</p>

        <h4>4. Data Sharing</h4>
        <p>We do not share your personal data with third parties except as required by law or with your explicit consent (e.g., for payment processing). Aggregated, anonymized data may be used for analytics.</p>

        <h4>5. Compliance with Data Privacy Act of 2012 (RA 10173)</h4>
        <p>We comply with the Data Privacy Act of 2012. Your data is processed transparently and lawfully. You have rights to access, correct, or delete your data, subject to legal obligations. Contact us at support@bsthardware.com to exercise these rights.</p>

        <h4>6. Consent</h4>
        <p>By checking the consent box during signup, you agree to the collection and processing of your data as described. Registration requires this consent.</p>

        <h4>7. Updates to Terms</h4>
        <p>We may update these terms. Continued use of the platform after changes indicates acceptance of the new terms.</p>

        <p>For inquiries, contact support@bsthardware.com.</p>

        <button className="close-button" onClick={() => setShowTerms(false)}>Close</button>
      </div>
    </div>
  );

  return (
    <div className="login-container">
      {showTerms && <TermsAndConditions />}
      <h2>{isLogin ? 'Log In' : 'Sign Up'}</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="input-wrapper">
            <input
              type="text"
              className="form-input"
              id="login-id"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())} // Trim input
              required
              disabled={loading}
              placeholder=" "
            />
            <label htmlFor="login-id">{isLogin ? 'Email or Username' : 'Username'}</label>
          </div>
        </div>
        {!isLogin && (
          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="email"
                className="form-input"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())} // Trim input
                required
                disabled={loading}
                placeholder=" "
              />
              <label htmlFor="email">Email</label>
            </div>
          </div>
        )}
        <div className="form-group password-group">
          <div className="input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input password-input"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder=" "
            />
            <label htmlFor="password">Password</label>
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              disabled={loading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {!isLogin && feedback && (
            <div className={`password-feedback ${feedback.valid ? 'valid' : 'invalid'}`}>
              {feedback.message}
            </div>
          )}
        </div>
        {!isLogin && (
          <div className="form-group consent-group">
            <label className="consent-label">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                disabled={loading}
              />
              I agree to the{' '}
              <button type="button" className="terms-link" onClick={() => setShowTerms(true)} disabled={loading}>
                Terms and Conditions and Privacy Policy
              </button>
            </label>
          </div>
        )}
        {error && <div className="form-error">{error}</div>}
        <button
          type="submit"
          className="login-button"
          disabled={loading || (!isLogin && (!validatePassword(password) || !consent))}
        >
          {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
        </button>
      </form>
      <div className="auth-toggle">
        {isLogin ? (
          <p>
            Don't have an account?{' '}
            <button className="toggle-button" onClick={toggleAuthMode} disabled={loading}>
              Sign Up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button className="toggle-button" onClick={toggleAuthMode} disabled={loading}>
              Log In
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;