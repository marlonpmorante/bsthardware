// routes/products.js
const express = require('express');
const { pool } = require('../config/db');
const { protect, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// This is how you would get the Socket.IO instance to emit events
// Assuming `req.app.get('socketio')` is set in server.js
let io; // Declare io variable globally in this module

// Middleware to get the socket.io instance
router.use((req, res, next) => {
    io = req.app.get('socketio');
    next();
});

// @route GET /api/products
// @desc Get all products
// @access Public (viewable by anyone, authenticated or not)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM products ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ message: 'Server error while fetching products.' });
    }
});

// @route GET /api/products/:id
// @desc Get a single product by ID
// @access Public
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.promise().query('SELECT * FROM products WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching single product:', error.message);
        res.status(500).json({ message: 'Server error while fetching product.' });
    }
});

// @route POST /api/products
// @desc Add a new product
// @access Private (Admin only)
router.post('/', protect, authorizeRoles('admin'), async (req, res) => {
    const { name, description, price, stock_quantity, category, image_url } = req.body;

    if (!name || !price || !stock_quantity) {
        return res.status(400).json({ message: 'Please provide product name, price, and stock quantity.' });
    }
    if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: 'Price must be a non-negative number.' });
    }
    if (isNaN(stock_quantity) || stock_quantity < 0) {
        return res.status(400).json({ message: 'Stock quantity must be a non-negative integer.' });
    }

    try {
        const [result] = await pool.promise().query(
            'INSERT INTO products (name, description, price, stock_quantity, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, price, stock_quantity, category, image_url]
        );
        const [newProductRows] = await pool.promise().query('SELECT * FROM products WHERE id = ?', [result.insertId]);
        const newProduct = newProductRows[0];

        // Emit real-time update to all connected clients
        if (io) {
            io.emit('productAdded', newProduct); // Notify frontend about new product
            io.emit('productsUpdate'); // General update notification to refetch all products
        }

        res.status(201).json({ message: 'Product added successfully.', product: newProduct });
    } catch (error) {
        console.error('Error adding product:', error.message);
        res.status(500).json({ message: 'Server error while adding product.' });
    }
});

// @route PUT /api/products/:id
// @desc Update an existing product
// @access Private (Admin only)
router.put('/:id', protect, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock_quantity, category, image_url } = req.body;

    if (!name || !price || !stock_quantity) {
        return res.status(400).json({ message: 'Please provide product name, price, and stock quantity.' });
    }
    if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: 'Price must be a non-negative number.' });
    }
    if (isNaN(stock_quantity) || stock_quantity < 0) {
        return res.status(400).json({ message: 'Stock quantity must be a non-negative integer.' });
    }

    try {
        const [result] = await pool.promise().query(
            'UPDATE products SET name = ?, description = ?, price = ?, stock_quantity = ?, category = ?, image_url = ? WHERE id = ?',
            [name, description, price, stock_quantity, category, image_url, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const [updatedProductRows] = await pool.promise().query('SELECT * FROM products WHERE id = ?', [id]);
        const updatedProduct = updatedProductRows[0];

        // Emit real-time update
        if (io) {
            io.emit('productUpdated', updatedProduct); // Notify frontend about updated product
            io.emit('productsUpdate'); // General update notification
        }

        res.json({ message: 'Product updated successfully.', product: updatedProduct });
    } catch (error) {
        console.error('Error updating product:', error.message);
        res.status(500).json({ message: 'Server error while updating product.' });
    }
});

// @route DELETE /api/products/:id
// @desc Delete a product
// @access Private (Admin only)
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.promise().query('DELETE FROM products WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Emit real-time update
        if (io) {
            io.emit('productDeleted', id); // Notify frontend about deleted product
            io.emit('productsUpdate'); // General update notification
        }

        res.json({ message: 'Product deleted successfully.', id });
    } catch (error) {
        console.error('Error deleting product:', error.message);
        res.status(500).json({ message: 'Server error while deleting product.' });
    }
});

module.exports = router;