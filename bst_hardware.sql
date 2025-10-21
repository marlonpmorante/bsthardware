-- Database creation (run this once, then use the database)
CREATE DATABASE IF NOT EXISTS bst_hardware;
USE bst_hardware;

-- Table for users (customers and administrators)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Hashed password
    role ENUM('user', 'admin') DEFAULT 'user' NOT NULL, -- 'user' for customers, 'admin' for management
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for products (inventory)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    category VARCHAR(100),
    image_url VARCHAR(255), -- URL to product image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for online canvassing requests (user inquiries)
CREATE TABLE canvass_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,           -- Who submitted the request
    product_id INT,                 -- Which product it's about (can be NULL for general inquiries)
    message TEXT NOT NULL,          -- The user's inquiry message
    status ENUM('pending', 'responded', 'closed') DEFAULT 'pending' NOT NULL, -- Status of the request
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL -- If product is deleted, set this to NULL
);

INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@bst.com', 'adminpass', 'admin');
INSERT INTO users (name, email, password, role) VALUES
('Regular User', 'user@bst.com', 'adminpass', 'user');
-- Example Admin User (IMPORTANT: Hash the password before inserting into actual DB!)
-- INSERT INTO users (name, email, password, role) VALUES
-- ('Admin User', 'admin@bst.com', '$2a$10$YourActualHashedPasswordHere...', 'admin');

-- Example Regular User
-- INSERT INTO users (name, email, password, role) VALUES
-- ('John Doe', 'john.doe@example.com', '$2a$10$AnotherHashedPasswordHere...', 'user');
 INSERT INTO products (name, description, price, stock_quantity, category, image_url) VALUES
('Hammer Pro 100', 'Heavy-duty claw hammer for professional use.', 25.50, 150, 'Tools', 'https://example.com/hammer.jpg'),
('Drill Bit Set (Steel)', 'Set of 10 high-speed steel drill bits.', 18.75, 200, 'Tools', 'https://example.com/drillbits.jpg'),
('Paint Brush (2 inch)', 'High quality synthetic paint brush.', 8.99, 300, 'Paint', 'https://example.com/paintbrush.jpg'),
('Philips Head Screwdriver', 'Standard #2 Philips head screwdriver.', 7.20, 250, 'Tools', 'https://example.com/screwdriver.jpg');
-- Example Products
-- INSERT INTO products (name, description, price, stock_quantity, category, image_url) VALUES
-- ('Hammer Pro 100', 'Heavy-duty claw hammer for professional use.', 25.50, 150, 'Tools', 'https://example.com/hammer.jpg'),
-- ('Drill Bit Set (Steel)', 'Set of 10 high-speed steel drill bits.', 18.75, 200, 'Tools', 'https://example.com/drillbits.jpg');
SELECT * FROM users;
SELECT * FROM products WHERE stock_quantity < 100;
SELECT name, price FROM products ORDER BY price DESC;
SELECT * FROM canvass_requests;