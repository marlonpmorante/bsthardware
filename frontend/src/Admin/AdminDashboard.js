import React, { useState, useEffect } from 'react';
import './Admin.css'; // Assuming you have a CSS file for admin styles

export const AdminDashboard = ({
  products,
  setProducts,
  error,
  setError,
  handleLogout, // Passed from App.js
  fetchProducts, // Passed from App.js to re-fetch after CRUD operations
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // For editing
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState(''); // Assuming description field
  const [formImageURL, setFormImageURL] = useState(''); // Assuming image_url field

  // Fetch products on component mount or when needed (already handled by App.js)
  useEffect(() => {
    if (products.length === 0 && !error) { // Only fetch if products are empty and no current error
      fetchProducts();
    }
  }, [products, error, fetchProducts]);

  const resetForm = () => {
    setFormName('');
    setFormPrice('');
    setFormCategory('');
    setFormDescription('');
    setFormImageURL('');
    setCurrentProduct(null);
    setIsAdding(false);
    setIsEditing(false);
    setError('');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Include JWT token for authentication
    };
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formName || !formPrice || !formCategory) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: formName,
          price: parseFloat(formPrice), // Ensure price is a number
          category: formCategory,
          description: formDescription,
          image_url: formImageURL,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product.');
      }

      await response.json(); // Or just check response.ok
      fetchProducts(); // Re-fetch products to update the list
      resetForm();
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.message || 'Failed to add product. Check console for details.');
    }
  };

  const handleEditClick = (product) => {
    setCurrentProduct(product);
    setFormName(product.name);
    setFormPrice(product.price);
    setFormCategory(product.category);
    setFormDescription(product.description || '');
    setFormImageURL(product.image_url || '');
    setIsEditing(true);
    setIsAdding(false); // Make sure add form is hidden
    setError('');
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!currentProduct || !formName || !formPrice || !formCategory) {
      setError('Product not selected or fields are missing.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${currentProduct._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: formName,
          price: parseFloat(formPrice),
          category: formCategory,
          description: formDescription,
          image_url: formImageURL,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product.');
      }

      await response.json();
      fetchProducts(); // Re-fetch products
      resetForm();
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message || 'Failed to update product. Check console for details.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product.');
      }

      fetchProducts(); // Re-fetch products
      resetForm(); // Clear any active forms
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product. Check console for details.');
    }
  };

  // Group products by category for display (similar to App.js, but using the fetched products)
  const categorizedProducts = products.length > 0
    ? products.reduce((acc, product) => {
        const category = product.category || "Uncategorized";
        const existingCategory = acc.find((cat) => cat.category === category);
        if (existingCategory) {
          existingCategory.items.push(product);
        } else {
          acc.push({ category, items: [product] });
        }
        return acc;
      }, [])
    : [];

  return (
    <div className="admin-dashboard-container">
      <h2>Admin Dashboard</h2>
      <button onClick={handleLogout} className="logout-button">Logout</button>

      {error && <p className="error-message">{error}</p>}

      <div className="admin-controls">
        <button onClick={() => { setIsAdding(!isAdding); setIsEditing(false); resetForm(); }} className="add-new-button">
          {isAdding ? 'Cancel Add' : 'Add New Product'}
        </button>
      </div>

      {(isAdding || isEditing) && (
        <div className="product-form-card">
          <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={isEditing ? handleUpdateProduct : handleAddProduct}>
            <div className="form-group">
              <label htmlFor="name">Product Name:</label>
              <input
                type="text"
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price (₱):</label>
              <input
                type="number"
                id="price"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                required
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <input
                type="text"
                id="category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description (Optional):</label>
              <textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows="3"
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="imageUrl">Image URL (Optional):</label>
              <input
                type="text"
                id="imageUrl"
                value={formImageURL}
                onChange={(e) => setFormImageURL(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button type="submit">
                {isEditing ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" onClick={resetForm} className="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <h3>Current Products</h3>
      {products.length === 0 ? (
        <p>No products available. Add some using the form above!</p>
      ) : (
        categorizedProducts.map((category, idx) => (
          category.items.length > 0 && (
            <div key={idx} className="category-section admin-category-section">
              <h4>{category.category}</h4>
              <ul className="admin-product-list">
                {category.items.map((item) => (
                  <li key={item._id} className="admin-product-item">
                    <div className="product-details">
                      {item.image_url && <img src={item.image_url} alt={item.name} className="product-image-thumb" />}
                      <span>{item.name} - ₱{item.price} ({item.category})</span>
                    </div>
                    <div className="product-actions">
                      <button onClick={() => handleEditClick(item)} className="edit-button">Edit</button>
                      <button onClick={() => handleDeleteProduct(item._id)} className="delete-button">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        ))
      )}
    </div>
  );
};