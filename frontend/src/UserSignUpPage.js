import React, { useState } from 'react';

const UserSignupPage = ({ setCurrentPage, setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setCurrentPage('login'); // Redirect to login after signup
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Sign Up</h2>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" className="login-button">
            Sign Up
          </button>
          <p>
            Already have an account?{' '}
            <span onClick={() => setCurrentPage('login')} style={{ color: '#3b82f6', cursor: 'pointer' }}>
              Login here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default UserSignupPage;