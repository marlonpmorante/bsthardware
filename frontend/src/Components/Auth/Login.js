// src/components/Auth/Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../App.css'; // Assuming some global styling or component specific

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth(); // Get the login function from AuthContext

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setError(''); // Clear previous errors
        setLoading(true); // Set loading state

        try {
            await login(email, password);
            // Redirection is handled by AuthContext upon successful login
        } catch (err) {
            // Display error message from backend or a generic one
            setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <div className="auth-container">
            <h2>Login to BST Hardware</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                {error && <p className="error-message">{error}</p>}

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? 'Logging In...' : 'Login'}
                </button>
            </form>
            <p className="auth-link">
                Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
        </div>
    );
}

export default Login;