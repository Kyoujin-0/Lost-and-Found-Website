const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { protect, optionalAuth } = require('../middleware/auth');

// @route   GET /api/items
// @desc    Get all items with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
    try {
        const {
            type, // 'lost' or 'found'
            status, // 'active', 'claimed', 'archived'
            category,
            search,
            sort = 'newest', // 'newest', 'oldest'
            limit = 50,
            offset = 0
        } = req.query;

        let queryText = `
            SELECT 
                i.*,
                u.student_id as poster_student_id,
                u.full_name as poster_name,
                (SELECT COUNT(*) FROM comments WHERE item_id = i.id) as comment_count
            FROM items i
            LEFT JOIN users u ON i.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        // Filter by type
        if (type && (type === 'lost' || type === 'found')) {
            queryText += ` AND i.item_type = $${paramCount}`;
            params.push(type);
            paramCount++;
        }

        // Filter by status
        if (status) {
            queryText += ` AND i.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        } else {
            // By default, only show active items
            queryText += ` AND i.status = 'active'`;
        }

        // Filter by category
        if (category) {
            queryText += ` AND i.category = $${paramCount}`;
            params.push(category);
            paramCount++;
        }

        // Search
        if (search) {
            queryText += ` AND (
                i.title ILIKE $${paramCount} OR 
                i.description ILIKE $${paramCount} OR 
                i.location ILIKE $${paramCount}
            )`;
            params.push(`%${search}%`);
            paramCount++;
        }

        // Sorting
        if (sort === 'oldest') {
            queryText += ` ORDER BY i.date_lost_found ASC, i.created_at ASC`;
        } else {
            queryText += ` ORDER BY i.date_lost_found DESC, i.created_at DESC`;
        }

        // Pagination
        queryText += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await query(queryText, params);

        res.json({
            success: true,
            count: result.rows.length,
            items: result.rows
        });
    } catch (error) {
        console.error('Get items error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/items/:id
// @desc    Get single item by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const result = await query(
            `SELECT 
                i.*,
                u.student_id as poster_student_id,
                u.full_name as poster_name,
                u.email as poster_email,
                u.phone as poster_phone
            FROM items i
            LEFT JOIN users u ON i.user_id = u.id
            WHERE i.id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        res.json({
            success: true,
            item: result.rows[0]
        });
    } catch (error) {
        console.error('Get item error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/items
// @desc    Create new item
// @access  Private
router.post('/', protect, [
    body('title').notEmpty().withMessage('Title is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('dateLostFound').notEmpty().withMessage('Date is required'),
    body('itemType').isIn(['lost', 'found']).withMessage('Item type must be lost or found')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }

    const {
        title,
        description,
        category,
        location,
        dateLostFound,
        itemType,
        contactEmail,
        contactPhone,
        imageUrl,
        emoji
    } = req.body;

    try {
        const result = await query(
            `INSERT INTO items (
                user_id, title, description, category, location, 
                date_lost_found, item_type, contact_email, contact_phone, 
                image_url, emoji
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`,
            [
                req.user.id,
                title,
                description || null,
                category,
                location,
                dateLostFound,
                itemType,
                contactEmail || null,
                contactPhone || null,
                imageUrl || null,
                emoji || null
            ]
        );

        res.status(201).json({
            success: true,
            item: result.rows[0]
        });
    } catch (error) {
        console.error('Create item error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private (only owner)
router.put('/:id', protect, async (req, res) => {
    try {
        // Check if item exists and user owns it
        const itemCheck = await query(
            'SELECT user_id FROM items WHERE id = $1',
            [req.params.id]
        );

        if (itemCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        if (itemCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this item'
            });
        }

        const {
            title,
            description,
            category,
            location,
            dateLostFound,
            contactEmail,
            contactPhone,
            imageUrl,
            emoji
        } = req.body;

        const result = await query(
            `UPDATE items SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                category = COALESCE($3, category),
                location = COALESCE($4, location),
                date_lost_found = COALESCE($5, date_lost_found),
                contact_email = COALESCE($6, contact_email),
                contact_phone = COALESCE($7, contact_phone),
                image_url = COALESCE($8, image_url),
                emoji = COALESCE($9, emoji),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $10
            RETURNING *`,
            [title, description, category, location, dateLostFound, contactEmail, contactPhone, imageUrl, emoji, req.params.id]
        );

        res.json({
            success: true,
            item: result.rows[0]
        });
    } catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PATCH /api/items/:id/claim
// @desc    Mark item as claimed
// @access  Private
router.patch('/:id/claim', protect, async (req, res) => {
    try {
        const result = await query(
            `UPDATE items SET
                status = 'claimed',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        res.json({
            success: true,
            item: result.rows[0]
        });
    } catch (error) {
        console.error('Claim item error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PATCH /api/items/:id/reactivate
// @desc    Reactivate item
// @access  Private (only owner)
router.patch('/:id/reactivate', protect, async (req, res) => {
    try {
        const itemCheck = await query(
            'SELECT user_id FROM items WHERE id = $1',
            [req.params.id]
        );

        if (itemCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        if (itemCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const result = await query(
            `UPDATE items SET
                status = 'active',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *`,
            [req.params.id]
        );

        res.json({
            success: true,
            item: result.rows[0]
        });
    } catch (error) {
        console.error('Reactivate item error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private (only owner)
router.delete('/:id', protect, async (req, res) => {
    try {
        const itemCheck = await query(
            'SELECT user_id FROM items WHERE id = $1',
            [req.params.id]
        );

        if (itemCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        if (itemCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this item'
            });
        }

        await query('DELETE FROM items WHERE id = $1', [req.params.id]);

        res.json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        console.error('Delete item error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;