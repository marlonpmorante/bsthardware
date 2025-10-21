// src/components/UserDashboard/UserDashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as productService from '../../services/productService';
import ProductCard from './ProductCard'; // Component for individual product display
import io from 'socket.io-client'; // Import Socket.IO client
import './App.css'; 

const API_URL = process.env.REACT_APP_API_URL; // From .env.local

function UserDashboard() {
    const { user, logout } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch products
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await productService.getProducts();
            setProducts(data);
        } catch (err) {
            setError('Failed to load products. Please try again.');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(); // Initial fetch

        // --- WebSocket setup for real-time updates ---
        const socket = io(process.env.REACT_APP_API_URL.replace('/api', '')); // Connect to the base URL of your backend server

        socket.on('connect', () => {
            console.log('Connected to WebSocket server from User Dashboard');
        });

        // Listen for general product updates (e.g., after any CRUD operation)
        socket.on('productsUpdate', () => {
            console.log('Received productsUpdate event, re-fetching products...');
            fetchProducts(); // Re-fetch all products on any general update
        });

        // Listen for specific product events (optional, can optimize updates)
        socket.on('productAdded', (newProduct) => {
            console.log('Product added:', newProduct);
            // If you're managing state more granularly, you could add this directly
            // setProducts(prev => [newProduct, ...prev]);
        });

        socket.on('productUpdated', (updatedProduct) => {
            console.log('Product updated:', updatedProduct);
            // setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
        });

        socket.on('productDeleted', (deletedProductId) => {
            console.log('Product deleted:', deletedProductId);
            // setProducts(prev => prev.filter(p => p.id !== deletedProductId));
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server from User Dashboard');
        });

        // Cleanup function for useEffect
        return () => {
            socket.disconnect(); // Disconnect socket when component unmounts
        };
    }, []); // Empty dependency array means this runs once on mount

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome, {user.name} ({user.role})!</h1>
                <button onClick={logout} className="logout-button">Logout</button>
            </header>

            <h2 className="section-title">Available Products</h2>
            {loading && <p className="loading-message">Loading products...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && products.length === 0 && !error && <p>No products available at the moment.</p>}

            <div className="product-grid">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

export default UserDashboard;