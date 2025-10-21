// routes/canvass.js
const express = require('express');
const { pool } = require('../config/db');
const { protect, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// @route POST /api/canvass/request
// @desc Submit a new canvass request
// @access Private (User only)
router.post('/request', protect, authorizeRoles('user'), async (req, res) => {
    const { product_id, message } = req.body;
    const user_id = req.user.id; // From authenticated user

    if (!message) {
        return res.status(400).json({ message: 'Canvass message cannot be empty.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO canvass_requests (user_id, product_id, message, status) VALUES (?, ?, ?, ?)',
            [user_id, product_id || null, message, 'pending']
        );
        const [newRequest] = await pool.query('SELECT * FROM canvass_requests WHERE id = ?', [result.insertId]);

        res.status(201).json({ message: 'Canvass request submitted successfully.', request: newRequest[0] });
    } catch (error) {
        console.error('Error submitting canvass request:', error.message);
        res.status(500).json({ message: 'Server error while submitting request.' });
    }
});

// @route GET /api/canvass/requests
// @desc Get all canvass requests
// @access Private (Admin only)
router.get('/requests', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        // You might want to join with users and products tables for more context
        const [rows] = await pool.query(
            `SELECT cr.*, u.name as user_name, u.email as user_email, p.name as product_name
             FROM canvass_requests cr
             JOIN users u ON cr.user_id = u.id
             LEFT JOIN products p ON cr.product_id = p.id
             ORDER BY cr.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching canvass requests:', error.message);
        res.status(500).json({ message: 'Server error while fetching requests.' });
    }
});

// @route PUT /api/canvass/requests/:id/status
// @desc Update status of a canvass request
// @access Private (Admin only)
router.put('/requests/:id/status', protect, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // e.g., 'responded', 'closed'

    if (!['pending', 'responded', 'closed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE canvass_requests SET status = ? WHERE id = ?',
            [status, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Canvass request not found.' });
        }
        res.json({ message: 'Canvass request status updated successfully.' });
    } catch (error) {
        console.error('Error updating canvass request status:', error.message);
        res.status(500).json({ message: 'Server error while updating status.' });
    }
});

module.exports = router;