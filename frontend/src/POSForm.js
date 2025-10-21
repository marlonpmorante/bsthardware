import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import { Search, X, ShoppingCart, DollarSign } from 'lucide-react';
import './POSForm.css';

const POSForm = ({ products, imageMap }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, products]);

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTax = (subtotal) => {
    const taxRate = 0.12; // 12% tax rate
    return subtotal * taxRate;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          items: cart,
          subtotal: calculateSubtotal(),
          tax: calculateTax(calculateSubtotal()),
          total: calculateTotal(),
          date: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to process sale');
      alert('Sale processed successfully!');
      clearCart();
    } catch (err) {
      console.error('Error processing sale:', err);
      alert('Failed to process sale. Please try again.');
    }
  };

  return (
    <div className="pos-container">
      <h2>Point of Sale</h2>
      <div className="pos-grid">
        <div className="products-section">
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input
              className="search-bar"
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-button"
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="products-list">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-item"
                  onClick={() => addToCart(product)}
                >
                  <img
                    src={imageMap[product.name] || '/placeholder.jpg'}
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p>₱{product.price}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No products found.</p>
            )}
          </div>
        </div>
        <div className="cart-section">
          <h3>Cart <ShoppingCart size={20} /></h3>
          {cart.length > 0 ? (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img
                      src={imageMap[item.name] || '/placeholder.jpg'}
                      alt={item.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <p>₱{item.price} x </p>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value))
                        }
                      />
                      <p>= ₱{(item.price * item.quantity).toFixed(2)}</p>
                      <button
                        className="remove-button"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-summary">
                <p>Subtotal: ₱{calculateSubtotal().toFixed(2)}</p>
                <p>Tax (12%): ₱{calculateTax(calculateSubtotal()).toFixed(2)}</p>
                <p>Total: ₱{calculateTotal().toFixed(2)}</p>
                <div className="cart-actions">
                  <button className="clear-cart-button" onClick={clearCart}>
                    Clear Cart
                  </button>
                  <button
                    className="checkout-button"
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                  >
                    Checkout <DollarSign size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p>Cart is empty.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default POSForm;