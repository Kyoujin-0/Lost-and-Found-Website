const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').notEmpty().withMessage('Full name is required')
], async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }

    const { studentId, username, email, password, fullName, phone } = req.body;

    try {
        // Check if user already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE student_id = $1 OR username = $2 OR email = $3',
            [studentId, username, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this student ID, username, or email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const result = await query(
            `INSERT INTO users (student_id, username, email, password, full_name, phone) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id, student_id, username, email, full_name, phone, created_at`,
            [studentId, username, email, hashedPassword, fullName, phone || null]
        );

        const user = result.rows[0];
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                studentId: user.student_id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('identifier').notEmpty().withMessage('Student ID, username, or email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }

    const { identifier, password } = req.body;

    try {
        // Find user by student_id, username, or email
        const result = await query(
            `SELECT * FROM users 
             WHERE student_id = $1 OR username = $1 OR email = $1`,
            [identifier]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                studentId: user.student_id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const result = await query(
            'SELECT id, student_id, username, email, full_name, phone, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = result.rows[0];
        res.json({
            success: true,
            user: {
                id: user.id,
                studentId: user.student_id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                phone: user.phone,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;