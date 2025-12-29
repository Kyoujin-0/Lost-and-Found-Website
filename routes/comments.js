const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { protect } = require('../middleware/auth');

// @route   GET /api/comments/:itemId
// @desc    Get all comments for an item
// @access  Public
router.get('/:itemId', async (req, res) => {
    try {
        const result = await query(
            `SELECT 
                c.*,
                u.student_id,
                u.full_name as author_name,
                u.username
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.item_id = $1
            ORDER BY c.created_at ASC`,
            [req.params.itemId]
        );

        res.json({
            success: true,
            count: result.rows.length,
            comments: result.rows
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/comments/:itemId
// @desc    Add comment to item
// @access  Private
router.post('/:itemId', protect, [
    body('text').notEmpty().withMessage('Comment text is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }

    const { text } = req.body;

    try {
        // Check if item exists
        const itemCheck = await query(
            'SELECT id FROM items WHERE id = $1',
            [req.params.itemId]
        );

        if (itemCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Create comment
        const result = await query(
            `INSERT INTO comments (item_id, user_id, text)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [req.params.itemId, req.user.id, text]
        );

        // Get comment with user info
        const commentWithUser = await query(
            `SELECT 
                c.*,
                u.student_id,
                u.full_name as author_name,
                u.username
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.id = $1`,
            [result.rows[0].id]
        );

        res.status(201).json({
            success: true,
            comment: commentWithUser.rows[0]
        });
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/comments/:commentId
// @desc    Delete comment
// @access  Private (only comment author)
router.delete('/:commentId', protect, async (req, res) => {
    try {
        // Check if comment exists and user owns it
        const commentCheck = await query(
            'SELECT user_id FROM comments WHERE id = $1',
            [req.params.commentId]
        );

        if (commentCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        if (commentCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        await query('DELETE FROM comments WHERE id = $1', [req.params.commentId]);

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;