import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "./config";
import { X, Plus, Minus } from "lucide-react";
import "./Cart.css";

const Cart = ({ cart, setCart, imageMap, setError }) => {
  const [loading, setLoading] = useState({});
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  // Fetch cart on component mount
  useEffect(() => {
    const fetchCart = async () => {
      console.log("Fetching cart...");
      setIsLoadingCart(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, cannot fetch cart.");
          setError("Please log in to view your cart.");
          setIsLoadingCart(false);
          return;
        }
        const response = await fetch(`${API_BASE_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            console.log("Unauthorized: Token invalid or expired.");
            setError("Session expired. Please log in again.");
            localStorage.removeItem("token");
            setIsLoadingCart(false);
            return;
          }
          throw new Error("Failed to fetch cart");
        }
        const cartData = await response.json();
        console.log("Cart data fetched:", cartData);
        setCart(cartData);
        setError(null);
      } catch (err) {
        console.error("Error fetching cart:", err.message);
        setError("Failed to load cart.");
      } finally {
        setIsLoadingCart(false);
      }
    };
    if (localStorage.getItem("token")) {
      fetchCart();
    } else {
      console.log("No token, skipping cart fetch.");
      setIsLoadingCart(false);
      setError("Please log in to view your cart.");
    }
  }, [setCart, setError]);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to update cart.");
        return;
      }
      const product = cart.find((item) => item.product_id === productId);
      if (newQuantity > product.stock) {
        setError(`Cannot add more ${product.name}. Only ${product.stock} in stock.`);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/cart/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          return;
        }
        throw new Error("Failed to update quantity");
      }
      const cartResponse = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!cartResponse.ok) throw new Error("Failed to fetch cart");
      const cartData = await cartResponse.json();
      console.log("Cart updated:", cartData);
      setCart(cartData);
      setError(null);
    } catch (err) {
      console.error("Error updating quantity:", err.message);
      setError("Failed to update quantity. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const removeFromCart = async (productId) => {
    setLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to remove items from cart.");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          return;
        }
        throw new Error("Failed to remove product");
      }
      const cartResponse = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!cartResponse.ok) throw new Error("Failed to fetch cart");
      const cartData = await cartResponse.json();
      console.log("Item removed, new cart:", cartData);
      setCart(cartData);
      setError(null);
      alert("Item removed from cart.");
    } catch (err) {
      console.error("Error removing from cart:", err.message);
      setError("Failed to remove item.");
    } finally {
      setLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  if (isLoadingCart) {
    return <div>Loading cart...</div>;
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-items">
            {cart.map((item) => (
              <li key={item.product_id} className="cart-item">
                <img
                  src={imageMap[item.name] || "/placeholder.jpg"}
                  alt={item.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>₱{item.price}</p>
                  <p>Stock: {item.stock !== undefined ? item.stock : "N/A"}</p>
                </div>
                <div className="quantity-control">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="quantity-btn"
                    disabled={loading[item.product_id] || item.quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="quantity-btn"
                    disabled={loading[item.product_id] || item.stock <= item.quantity}
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="remove-btn"
                    disabled={loading[item.product_id]}
                  >
                    <X size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <h3>Total: ₱{calculateTotal()}</h3>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;