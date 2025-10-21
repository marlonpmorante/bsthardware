CREATE DATABASE IF NOT EXISTS bst_hard;
USE bst_hard;

-- Drop existing tables to reset schema
DROP TABLE IF EXISTS cart_notifications;
DROP TABLE IF EXISTS user_activity;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS admins;

-- Create admins table
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  category VARCHAR(255)
);

-- Create carts table
CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create cart_items table
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create user_activity table
CREATE TABLE user_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  username VARCHAR(50) NOT NULL,
  role ENUM('user', 'admin') NOT NULL,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45)
);

-- Create cart_notifications table
CREATE TABLE cart_notifications (
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
);

-- Seed products
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
('Measuring Tape', 100.00, 'measuring_tape.jpg', 'Hand Tools');