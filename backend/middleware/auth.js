// middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware to protect routes: verifies JWT token and attaches user info to req
const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (e.g., "Bearer TOKEN_STRING")
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user (id, role) from token payload to the request object
            req.user = decoded;

            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed or expired' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// Middleware to authorize roles: checks if the user's role is allowed
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // req.user must be available from the 'protect' middleware
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Access denied. Your role (${req.user ? req.user.role : 'none'}) is not authorized to access this resource.` });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };