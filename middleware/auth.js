const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const result = await query(
            'SELECT id, student_id, username, email, full_name FROM users WHERE id = $1',
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Add user to request object
        req.user = result.rows[0];
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });
    }
};

// Optional auth - doesn't require token but adds user if present
const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await query(
            'SELECT id, student_id, username, email, full_name FROM users WHERE id = $1',
            [decoded.id]
        );

        if (result.rows.length > 0) {
            req.user = result.rows[0];
        }
    } catch (error) {
        // Token invalid, but that's okay for optional auth
        console.log('Optional auth token invalid');
    }

    next();
};

module.exports = { protect, optionalAuth };