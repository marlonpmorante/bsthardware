// src/components/AdminDashboard/ProductForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as productService from '../../services/productService';
import '../../App.css'; // For form styling

function ProductForm() {
    const { id } = useParams(); // Get product ID if in edit mode
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category: '',
        image_url: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isEditMode = Boolean(id); // True if ID is present in URL

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            const fetchProduct = async () => {
                try {
                    const product = await productService.getProductById(id);
                    setFormData({
                        name: product.name,
                        description: product.description || '',
                        price: product.price,
                        stock_quantity: product.stock_quantity,
                        category: product.category || '',
                        image_url: product.image_url || ''
                    });
                } catch (err) {
                    setError('Failed to load product for editing. ' + (err.response?.data?.message || err.message));
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Basic client-side validation
        if (!formData.name || !formData.price || !formData.stock_quantity) {
            setError('Name, Price, and Stock Quantity are required.');
            setLoading(false);
            return;
        }
        if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
            setError('Price must be a non-negative number.');
            setLoading(false);
            return;
        }
        if (isNaN(formData.stock_quantity) || parseInt(formData.stock_quantity) < 0) {
            setError('Stock quantity must be a non-negative integer.');
            setLoading(false);
            return;
        }

        try {
            if (isEditMode) {
                await productService.updateProduct(id, formData);
                setSuccess('Product updated successfully!');
            } else {
                await productService.addProduct(formData);
                setSuccess('Product added successfully!');
                // Clear form after adding new product
                setFormData({ name: '', description: '', price: '', stock_quantity: '', category: '', image_url: '' });
            }
            // Optionally navigate back to admin products list after a short delay
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 1500);
        } catch (err) {
            setError('Operation failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) return <div className="loading-message">Loading product data...</div>;

    return (
        <div className="product-form-container">
            <h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="product-form">
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <div className="form-group">
                    <label htmlFor="name">Product Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        disabled={loading}
                    ></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="price">Price:</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        step="0.01"
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="stock_quantity">Stock Quantity:</label>
                    <input
                        type="number"
                        id="stock_quantity"
                        name="stock_quantity"
                        value={formData.stock_quantity}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="category">Category:</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="image_url">Image URL:</label>
                    <input
                        type="text"
                        id="image_url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>
                <div className="form-actions">
                    <button type="submit" disabled={loading} className="submit-button">
                        {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Add Product')}
                    </button>
                    <button type="button" onClick={() => navigate('/admin/dashboard')} className="cancel-button">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProductForm;