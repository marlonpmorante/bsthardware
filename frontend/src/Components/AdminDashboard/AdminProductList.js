// src/components/AdminDashboard/AdminProductList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as productService from './services/productService';
import io from 'socket.io-client'; // Import Socket.IO client
import '../../App.css'; // For styling

const API_URL = process.env.REACT_APP_API_URL;

function AdminProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await productService.getProducts();
            setProducts(data);
        } catch (err) {
            setError('Failed to load products for admin. Please try again.');
            console.error('Admin product fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();

        // --- WebSocket setup for real-time updates ---
        const socket = io(process.env.REACT_APP_API_URL.replace('/api', ''));

        socket.on('connect', () => {
            console.log('Connected to WebSocket server from Admin Product List');
        });

        // Listen for general product updates to refresh the list
        socket.on('productsUpdate', () => {
            console.log('Admin: Received productsUpdate event, re-fetching products...');
            fetchProducts();
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server from Admin Product List');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productService.deleteProduct(id);
                // No need to manually filter, fetchProducts will be triggered by WebSocket
                // setProducts(products.filter(p => p.id !== id));
            } catch (err) {
                alert('Failed to delete product: ' + (err.response?.data?.message || err.message));
                console.error('Error deleting product:', err);
            }
        }
    };

    if (loading) return <div className="loading-message">Loading products...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-product-list">
            <h2 className="section-title">Manage Products</h2>
            <div className="product-table-container">
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Category</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                    ) : (
                                        <span>No Image</span>
                                    )}
                                </td>
                                <td>{product.name}</td>
                                <td>${product.price.toFixed(2)}</td>
                                <td>{product.stock_quantity}</td>
                                <td>{product.category || 'N/A'}</td>
                                <td>
                                    <Link to={`/admin/products/edit/${product.id}`} className="action-button edit">Edit</Link>
                                    <button onClick={() => handleDelete(product.id)} className="action-button delete">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {products.length === 0 && <p>No products found. Add some!</p>}
        </div>
    );
}

export default AdminProductList;