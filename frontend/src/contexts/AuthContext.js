// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../../services/authService'; // API calls for auth

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // To manage initial auth check

    useEffect(() => {
        // On component mount, try to load user data from local storage
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                console.error("Failed to parse user data from localStorage:", error);
                // Clear invalid data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false); // Authentication check is complete
    }, []);

    const login = async (email, password) => {
        try {
            const { token, user: loggedInUser } = await authService.login(email, password);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            setUser(loggedInUser);
            return true; // Indicate success
        } catch (error) {
            console.error("Login failed in AuthContext:", error);
            throw error; // Re-throw to be caught by the calling component (Login.js)
        }
    };

    const signup = async (name, email, password) => {
        try {
            const { token, user: signedUpUser } = await authService.signup(name, email, password);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(signedUpUser));
            setUser(signedUpUser);
            return true; // Indicate success
        } catch (error) {
            console.error("Signup failed in AuthContext:", error);
            throw error; // Re-throw to be caught by the calling component (Signup.js)
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // Optionally redirect to login page directly here, or let the ProtectedRoute handle it
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to consume the AuthContext easily
export const useAuth = () => {
    return useContext(AuthContext);
};