// src/components/UserDashboard/ProductDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as productService from '../../services/productService';
import CanvassForm from './CanvassForm'; // For submitting inquiries
import '../../App.css'; // For styling

function ProductDetail() {
    const { id } = useParams(); // Get product ID from URL
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const data = await productService.getProductById(id);
                setProduct(data);
            } catch (err) {
                setError('Failed to load product details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]); // Re-fetch if ID changes

    if (loading) return <div className="loading-message">Loading product details...</div>;
    if (error) return <div className="error-message">{error} <button onClick={() => navigate('/products')}>Back to Products</button></div>;
    if (!product) return <div className="error-message">Product not found. <button onClick={() => navigate('/products')}>Back to Products</button></div>;

    return (
        <div className="product-detail-container">
            <button onClick={() => navigate('/products')} className="back-button">← Back to Products</button>
            <div className="product-detail-card">
                {product.image_url && <img src={product.image_url} alt={product.name} className="detail-image" />}
                <h1>{product.name}</h1>
                <p className="detail-price">Price: ${product.price.toFixed(2)}</p>
                <p className="detail-stock">Stock: {product.stock_quantity > 0 ? product.stock_quantity : 'Out of Stock'}</p>
                <p className="detail-description">{product.description}</p>
                <p className="detail-category">Category: {product.category || 'N/A'}</p>

                <hr />

                <h2>Inquire about this product</h2>
                <CanvassForm productId={product.id} productName={product.name} />
            </div>
        </div>
    );
}

export default ProductDetail;