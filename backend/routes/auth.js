// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db'); // Database connection pool
const router = express.Router();

// Helper function to generate a JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
};

// @route POST /api/auth/signup
// @desc Register a new user
// @access Public
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields: name, email, and password.' });
    }

    try {
        // Check if user already exists
        const [rows] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10); // Generate a salt
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt

        // Insert new user into database
        const [result] = await pool.promise().query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'user'] // Default role is 'user'
        );

        // Generate JWT token for the newly registered user
        const token = generateToken(result.insertId, 'user');

        res.status(201).json({
            message: 'User registered successfully and logged in.',
            token,
            user: {
                id: result.insertId,
                name,
                email,
                role: 'user'
            }
        });
    } catch (error) {
        console.error('Error during user signup:', error.message);
        res.status(500).json({ message: 'Server error during signup. Please try again later.' });
    }
});

// @route POST /api/auth/login
// @desc Authenticate user & get token
// @access Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter both email and password.' });
    }

    try {
        // Check if user exists
        const [rows] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials.' }); // Generic message for security
        }

        const user = rows[0];

        // Compare provided password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' }); // Generic message for security
        }

        // Generate JWT token
        const token = generateToken(user.id, user.role);

        res.json({
            message: 'Logged in successfully.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error during user login:', error.message);
        res.status(500).json({ message: 'Server error during login. Please try again later.' });
    }
});

module.exports = router;