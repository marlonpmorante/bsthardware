// src/components/UserDashboard/ProductCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../../App.css'; // For card styling

function ProductCard({ product }) {
    return (
        <div className="product-card">
            {product.image_url && <img src={product.image_url} alt={product.name} className="product-image" />}
            <h3>{product.name}</h3>
            <p className="product-price">${product.price.toFixed(2)}</p>
            <p className="product-stock">Stock: {product.stock_quantity}</p>
            <p className="product-description">{product.description.substring(0, 100)}...</p> {/* Truncate description */}
            <Link to={`/products/${product.id}`} className="view-details-button">View Details</Link>
        </div>
    );
}

export default ProductCard;