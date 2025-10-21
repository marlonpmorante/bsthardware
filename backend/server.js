require('dotenv').config();
const express = require('express');
const { pool: db, initDatabase } = require('./config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.mkdir(uploadDir, { recursive: true }).then(() => cb(null, uploadDir)).catch((err) => cb(err));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Ensure we can connect to the database (Railway/local)
initDatabase();

// Initialize database tables and seed data
const initializeDatabase = async () => {
  try {
    // Create admins table
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255),
        category VARCHAR(255)
      )
    `);

    // Create carts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create cart_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cart_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Create user_activity table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        username VARCHAR(50) NOT NULL,
        role ENUM('user', 'admin') NOT NULL,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45)
      )
    `);

    // Create cart_notifications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        username VARCHAR(50) NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Seed default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.query(
      `INSERT INTO admins (username, password, email) 
       VALUES ('admin', ?, 'admin@bsthardware.com') 
       ON DUPLICATE KEY UPDATE password=VALUES(password), email=VALUES(email)`,
      [hashedPassword]
    );

    // Seed products if table is empty
    const [productCount] = await db.query('SELECT COUNT(*) AS count FROM products');
    if (productCount[0].count === 0) {
      await db.query(`
        INSERT INTO products (name, price, image_url, category) VALUES
        ('Cement', 350.00, 'cement.jpg', 'Construction Materials'),
        ('Sand', 1500.00, 'sand.jpg', 'Construction Materials'),
        ('Hollow Blocks', 15.00, 'hollow_blocks.jpg', 'Construction Materials'),
        ('Wood', 80.00, 'wood.jpg', 'Construction Materials'),
        ('Steel Bars', 1200.00, 'steel_bars.jpg', 'Construction Materials'),
        ('Nails', 100.00, 'nails.jpg', 'Construction Materials'),
        ('Screws', 150.00, 'screws.jpg', 'Construction Materials'),
        ('Paint', 750.00, 'paint.jpg', 'Paint & Finishing'),
        ('Thinner', 200.00, 'thinner.jpg', 'Paint & Finishing'),
        ('Brush', 80.00, 'brush.jpg', 'Paint & Finishing'),
        ('Roller', 150.00, 'roller.jpg', 'Paint & Finishing'),
        ('Masking Tape', 60.00, 'masking_tape.jpg', 'Paint & Finishing'),
        ('PVC Pipes', 120.00, 'pvc_pipes.jpg', 'Plumbing Tools'),
        ('Faucet', 250.00, 'faucet.jpg', 'Plumbing Tools'),
        ('Fittings', 40.00, 'fittings.jpg', 'Plumbing Tools'),
        ('Sealant', 180.00, 'sealant.jpg', 'Plumbing Tools'),
        ('Wires', 950.00, 'wires.jpg', 'Electrical Tools'),
        ('Switch', 120.00, 'switch.jpg', 'Electrical Tools'),
        ('Outlet', 150.00, 'outlet.jpg', 'Electrical Tools'),
        ('Breaker', 450.00, 'breaker.jpg', 'Electrical Tools'),
        ('Light Bulb', 300.00, 'light_bulbs.jpg', 'Electrical Tools'),
        ('Battery', 100.00, 'battery.jpg', 'Electrical Tools'),
        ('Door Knobs', 350.00, 'door_knobs.jpg', 'Home Hardware'),
        ('Hinges', 90.00, 'hinges.jpg', 'Home Hardware'),
        ('Padlocks', 200.00, 'padlock.jpg', 'Home Hardware'),
        ('Shelves', 1000.00, 'shelves.jpg', 'Home Hardware'),
        ('Drills', 2500.00, 'drills.jpg', 'Power Tools'),
        ('Grinders', 2000.00, 'grinders.jpg', 'Power Tools'),
        ('Saws', 1800.00, 'saws.jpg', 'Power Tools'),
        ('Welding Machines', 6000.00, 'welding_machines.jpg', 'Power Tools'),
        ('Hammer', 250.00, 'hammers.jpg', 'Hand Tools'),
        ('Wrench', 300.00, 'wrench.jpg', 'Hand Tools'),
        ('Screwdriver', 120.00, 'screwds.jpg', 'Hand Tools'),
        ('Pliers', 180.00, 'pliers.jpg', 'Hand Tools'),
        ('Measuring Tape', 100.00, 'measuring_tape.jpg', 'Hand Tools')
      `);
    }

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err.message, err.stack);
  }
};
initializeDatabase();

// Middleware to authenticate and restrict to non-admin users
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'user') {
      return res.status(403).json({ error: 'Access restricted to non-admin users' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to authenticate and restrict to admins
const authenticateAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access restricted to admins' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Products endpoints
app.get('/api/products', async (req, res) => {
  console.log('Received request for /api/products');
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

app.post('/api/products', authenticateAdmin, upload.single('image'), async (req, res) => {
  console.log('Received request for /api/products (POST)');
  try {
    const { name, price, category } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }
    const imageUrl = req.file ? req.file.filename : null;
    const [result] = await db.query(
      'INSERT INTO products (name, price, image_url, category) VALUES (?, ?, ?, ?)',
      [name.trim(), parseFloat(price), imageUrl, category]
    );
    res.status(201).json({ message: 'Product added successfully', id: result.insertId });
  } catch (err) {
    console.error('Error adding product:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.put('/api/products/:id', authenticateAdmin, upload.single('image'), async (req, res) => {
  console.log('Received request for /api/products/:id (PUT)');
  try {
    const { id } = req.params;
    const { name, price, category } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }
    const imageUrl = req.file ? req.file.filename : null;
    const [result] = await db.query(
      'UPDATE products SET name = ?, price = ?, image_url = ?, category = ? WHERE id = ?',
      [name.trim(), parseFloat(price), imageUrl || null, category, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
  console.log('Received request for /api/products/:id (DELETE)');
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// User signup endpoint
app.post('/api/signup', async (req, res) => {
  console.log('Received request for /api/signup');
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const [existing] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
  console.log('Received request for /api/login');
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Log login activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await db.query(
      'INSERT INTO user_activity (user_id, username, role, ip_address) VALUES (?, ?, ?, ?)',
      [user.id, user.username, 'user', ipAddress]
    );
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Login error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Admin login endpoint
app.post('/api/admin-login', async (req, res) => {
  console.log('Received request for /api/admin-login');
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const [admins] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (admins.length === 0) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    const admin = admins[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Log login activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await db.query(
      'INSERT INTO user_activity (user_id, username, role, ip_address) VALUES (?, ?, ?, ?)',
      [admin.id, admin.username, 'admin', ipAddress]
    );
    res.json({ message: 'Admin login successful', token });
  } catch (err) {
    console.error('Admin login error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get users (admin only)
app.get('/api/users', authenticateAdmin, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email, created_at FROM users');
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete user (admin only)
app.delete('/api/users/:userId', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get user cart
app.get('/api/cart', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const [carts] = await db.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    let cartId;
    if (carts.length === 0) {
      const [result] = await db.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      cartId = result.insertId;
    } else {
      cartId = carts[0].id;
    }
    const [items] = await db.query(`
      SELECT ci.product_id, ci.quantity, p.name, p.price, p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cartId]);
    res.status(200).json(items);
  } catch (err) {
    console.error('Error fetching cart:', err.message);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add product to cart
app.post('/api/cart/add', authenticateUser, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid product ID or quantity' });
    }
    const userId = req.user.id;
    const [carts] = await db.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    let cartId;
    if (carts.length === 0) {
      const [result] = await db.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      cartId = result.insertId;
    } else {
      cartId = carts[0].id;
    }
    const [existingItem] = await db.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );
    if (existingItem.length > 0) {
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [existingItem[0].quantity + quantity, existingItem[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        [cartId, productId, quantity]
      );
    }
    // Log cart notification
    const [product] = await db.query('SELECT name, price FROM products WHERE id = ?', [productId]);
    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const [user] = await db.query('SELECT username FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const total = (product[0].price * quantity).toFixed(2);
    await db.query(
      'INSERT INTO cart_notifications (user_id, username, product_id, product_name, quantity, total) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, user[0].username, productId, product[0].name, quantity, total]
    );
    res.status(200).json({ message: 'Product added to cart' });
  } catch (err) {
    console.error('Error adding to cart:', err.message);
    res.status(500).json({ error: 'Failed to add product to cart' });
  }
});

// Update cart item quantity
app.put('/api/cart/update', authenticateUser, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid product ID or quantity' });
    }
    const userId = req.user.id;
    const [carts] = await db.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (carts.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    const cartId = carts[0].id;
    const [existingItem] = await db.query(
      'SELECT id FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );
    if (existingItem.length === 0) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    await db.query(
      'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?',
      [quantity, cartId, productId]
    );
    res.status(200).json({ message: 'Cart updated successfully' });
  } catch (err) {
    console.error('Error updating cart:', err.message);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove product from cart
app.delete('/api/cart/remove/:productId', authenticateUser, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const [carts] = await db.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (carts.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    const cartId = carts[0].id;
    const [result] = await db.query(
      'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    res.status(200).json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Error removing item from cart:', err.message);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Checkout
app.post('/api/cart/checkout', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const [carts] = await db.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (carts.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    const cartId = carts[0].id;
    const [items] = await db.query('SELECT * FROM cart_items WHERE cart_id = ?', [cartId]);
    if (items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    // Placeholder: Clear cart (in future, record transaction)
    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    res.status(200).json({ message: 'Checkout successful' });
  } catch (err) {
    console.error('Checkout error:', err.message);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Get cart notifications (admin only)
app.get('/api/cart-notifications', authenticateAdmin, async (req, res) => {
  try {
    const [notifications] = await db.query('SELECT * FROM cart_notifications');
    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error fetching cart notifications:', err.message);
    res.status(500).json({ error: 'Failed to fetch cart notifications' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// User signup endpoint
app.post('/api/signup', async (req, res) => {
  console.log('Received request for /api/signup');
  try {
    const { username, password, email, consent } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!consent) {
      return res.status(400).json({ error: 'You must agree to the Terms and Conditions and Privacy Policy' });
    }
    const [existing] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to register user' });
  }
});