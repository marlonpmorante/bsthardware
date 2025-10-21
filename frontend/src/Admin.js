import React, { useState, useEffect } from "react";
import { Edit, Trash, Box, ShoppingCart, Users } from "lucide-react";
import './AdminDashboard.css';

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" onClick={onConfirm} className="confirm-button">Yes</button>
          <button type="button" onClick={onCancel} className="cancel-button">No</button>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard = ({ products, setProducts, error, setError, handleLogout, fetchProducts, imageMap, isLoadingProducts }) => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    price: "",
    image: null,
    category: "",
  });
  const [formError, setFormError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [users, setUsers] = useState([]);
  const [userError, setUserError] = useState("");
  const [aggregatedNotifications, setAggregatedNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState({ category: '', page: 1 });
  const [itemsPerPage] = useState(5);

  const categories = [
    "Construction Materials",
    "Paint & Finishing",
    "Plumbing Tools",
    "Electrical Tools",
    "Home Hardware",
    "Power Tools",
    "Hand Tools",
  ];

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("userToken");
      if (!token) throw new Error("No authentication token found. Please log in.");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorData;
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          console.error("Non-JSON response received:", text);
          throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.error || `Failed to fetch users: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data);
      setUserError("");
    } catch (err) {
      console.error("Error in fetchUsers:", err);
      if (err.name === "AbortError") {
        setUserError("Request timed out. Please try again.");
      } else {
        setUserError(err.message || "Failed to load users");
      }
    }
  };

  const fetchCartNotifications = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("userToken");
      if (!token) throw new Error("No authentication token found. Please log in.");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch("http://localhost:5000/api/cart-notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorData;
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          console.error("Non-JSON response received:", text);
          throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.error || `Failed to fetch cart notifications: ${response.statusText}`);
      }
      const data = await response.json();
      const aggregated = {};
      data.forEach((notification) => {
        const key = `${notification.user_id}_${notification.product_id}`;
        if (!aggregated[key] || new Date(notification.created_at) > new Date(aggregated[key].created_at)) {
          aggregated[key] = notification;
        }
      });
      setAggregatedNotifications(Object.values(aggregated));
      setNotificationError("");
    } catch (err) {
      console.error("Error in fetchCartNotifications:", err);
      if (err.name === "AbortError") {
        setNotificationError("Request timed out. Please try again.");
      } else {
        setNotificationError(err.message || "Failed to load cart notifications");
      }
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
    if (activeTab === "items") {
      fetchCartNotifications();
      const interval = setInterval(fetchCartNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const calculateGrandTotal = () => {
    return aggregatedNotifications
      .reduce((total, notification) => total + parseFloat(notification.total || 0), 0)
      .toFixed(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
    if (name === "price" && value && parseFloat(value) <= 0) {
      setFormError("Price must be positive.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    if (!formData.name || !formData.price || !formData.category) {
      setFormError("Name, price, and category are required.");
      return;
    }
    if (parseFloat(formData.price) <= 0) {
      setFormError("Price must be positive.");
      return;
    }

    // Check for duplicate product name in the same category
    const isDuplicate = products.some(product => 
      product.name.toLowerCase() === formData.name.toLowerCase() && 
      product.category === formData.category && 
      (!isEditing || product.id !== formData.id)
    );
    if (isDuplicate && !isEditing) {
      setFormError("A product with this name already exists in the selected category.");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("token") || localStorage.getItem("userToken");
    if (!token) {
      setFormError("No authentication token found. Please log in.");
      setIsLoading(false);
      setTimeout(handleLogout, 2000);
      return;
    }

    const url = isEditing
      ? `http://localhost:5000/api/products/${formData.id}`
      : `http://localhost:5000/api/products`;
    const method = isEditing ? "PUT" : "POST";

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("price", parseFloat(formData.price));
    data.append("category", formData.category);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorData;
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          console.error("Non-JSON response received:", text);
          throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
        }
        if (response.status === 401) {
          setFormError("Session expired. Please log in again.");
          setTimeout(handleLogout, 2000);
          return;
        }
        if (response.status === 404 && isEditing) {
          setFormError("Product not found. It may have been deleted.");
          return;
        }
        throw new Error(errorData.error || `Operation failed: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Expected JSON, received:", text);
        throw new Error("Invalid response format from server");
      }

      await response.json();
      await fetchProducts();
      setFormData({ id: null, name: "", price: "", image: null, category: "" });
      setImagePreview(null);
      setFormError(isEditing ? "Product updated successfully!" : "Product added successfully!");
      setTimeout(() => setFormError(""), 3000);
      setIsEditing(false);
    } catch (err) {
      console.error("Error in handleAddOrUpdateProduct:", err);
      if (err.name === "AbortError") {
        setFormError("Request timed out. Please try again.");
      } else {
        setFormError(err.message || `Failed to ${isEditing ? "update" : "add"} product`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setFormData({
      id: product.id || null,
      name: product.name || "",
      price: (product.price || 0).toString(),
      image: null,
      category: product.category || "",
    });
    setImagePreview(product.image_url ? `http://localhost:5000/uploads/${product.image_url}` : (imageMap[product.name] || null));
    setIsEditing(true);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDeleteProduct = (id) => {
    setProductToDelete(id);
    setShowModal(true);
  };

  const handleDeleteProductConfirmed = async () => {
    if (isLoading || productToDelete === null) return;
    setIsLoading(true);
    setShowModal(false);

    const token = localStorage.getItem("token") || localStorage.getItem("userToken");
    if (!token) {
      setFormError("No authentication token found. Please log in.");
      setIsLoading(false);
      setTimeout(handleLogout, 2000);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`http://localhost:5000/api/products/${productToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorData;
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          console.error("Non-JSON response received:", text);
          throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
        }
        if (response.status === 401) {
          setFormError("Session expired. Please log in again.");
          setTimeout(handleLogout, 2000);
          return;
        }
        if (response.status === 404) {
          setFormError("Product not found. It may have already been deleted.");
          return;
        }
        throw new Error(errorData.error || `Delete failed: ${response.statusText}`);
      }

      await fetchProducts();
      setFormError("Product deleted successfully!");
      setTimeout(() => setFormError(""), 3000);
      setProductToDelete(null);
    } catch (err) {
      console.error("Error in handleDeleteProductConfirmed:", err);
      if (err.name === "AbortError") {
        setFormError("Request timed out. Please try again.");
      } else {
        setFormError(err.message || "Failed to delete product");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteUser = (id) => {
    setUserToDelete(id);
    setShowModal(true);
  };

  const handleDeleteUser = async () => {
    if (isLoading || !userToDelete) return;
    setIsLoading(true);
    setShowModal(false);

    const token = localStorage.getItem("token") || localStorage.getItem("userToken");
    if (!token) {
      setUserError("No authentication token found. Please log in.");
      setIsLoading(false);
      setTimeout(handleLogout, 2000);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`http://localhost:5000/api/users/${userToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorData;
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          console.error("Non-JSON response received:", text);
          throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
        }
        if (response.status === 401) {
          setUserError("Session expired. Please log in again.");
          setTimeout(handleLogout, 2000);
          return;
        }
        throw new Error(errorData.error || `Delete failed: ${response.statusText}`);
      }

      await fetchUsers();
      setUserError("User deleted successfully!");
      setTimeout(() => setUserError(""), 3000);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error in handleDeleteUser:", err);
      if (err.name === "AbortError") {
        setUserError("Request timed out. Please try again.");
      } else {
        setUserError(err.message || "Failed to delete user");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancelled = () => {
    setShowModal(false);
    setProductToDelete(null);
    setUserToDelete(null);
  };

  const handleCancelEdit = () => {
    setFormData({ id: null, name: "", price: "", image: null, category: "" });
    setImagePreview(null);
    setIsEditing(false);
    setFormError("");
  };

  const getSortedFilteredProducts = () => {
    return Array.isArray(products) ? [...products] : [];
  };

  const paginateProducts = (products, category) => {
    const categoryProducts = Array.isArray(products) ? products.filter((product) => product.category === category) : [];
    const uniqueProducts = categoryProducts.reduce((acc, current) => {
      const x = acc.find(item => item.name === current.name);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    const indexOfLastItem = currentPage.page * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return uniqueProducts.slice(indexOfFirstItem, indexOfLastItem);
  };

  const paginate = (category, pageNumber) => {
    setCurrentPage({ category, page: pageNumber });
  };

  const getPageNumbers = (category) => {
    const categoryProducts = getSortedFilteredProducts().filter((product) => product.category === category);
    const uniqueProducts = categoryProducts.reduce((acc, current) => {
      const x = acc.find(item => item.name === current.name);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    return Math.ceil(uniqueProducts.length / itemsPerPage);
  };

  const getProductImage = (product) => {
    return product?.image_url ? `http://localhost:5000/uploads/${product.image_url}` : (imageMap[product?.name] || "/placeholder.jpg");
  };

  const filteredProducts = getSortedFilteredProducts().filter((product) => 
    !filterCategory || product.category === filterCategory
  );

  return (
    <div className="page-content">
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h2>Product Management Dashboard</h2>
        </div>

        <div className="dashboard-tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
            disabled={isLoading || isLoadingProducts}
          >
            <Box size={16} /> Inventory
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === "items" ? "active" : ""}`}
            onClick={() => setActiveTab("items")}
            disabled={isLoading}
          >
            <ShoppingCart size={16} /> Items
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
            disabled={isLoading}
          >
            <Users size={16} /> Users
          </button>
        </div>

        {activeTab === "inventory" && (
          <div className="inventory-section">
            <div className="product-form-container">
              <h3>{isEditing ? "Edit Product" : "Add New Product"}</h3>
              <form className="product-form" onSubmit={handleAddOrUpdateProduct}>
                {formError && (
                  <p className={`error-message ${formError.includes("successfully") ? "success-message" : ""}`}>
                    {formError}
                  </p>
                )}
                <div className="form-group">
                  <label htmlFor="name">Product Name</label>
                  <input
                    id="name"
                    name="name"
                    className="form-input"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                    disabled={isLoading || isLoadingProducts}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="price">Price (₱)</label>
                  <input
                    id="price"
                    name="price"
                    className="form-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    required
                    disabled={isLoading || isLoadingProducts}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="image">Add Image (optional)</label>
                  <input
                    id="image"
                    name="image"
                    className="form-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading || isLoadingProducts}
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="image-preview" style={{ maxWidth: "200px", marginTop: "10px" }} />
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    className="form-input"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading || isLoadingProducts}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-button" disabled={isLoading || isLoadingProducts}>
                    {isLoading ? "Saving..." : isEditing ? "Update Product" : "Add Product"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={handleCancelEdit}
                      disabled={isLoading || isLoadingProducts}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="product-list-container">
              <h3>Product List</h3>
              <div className="product-list-controls">
                <div className="filter-group">
                  <label htmlFor="filter-category">Filter by Category: </label>
                  <select
                    id="filter-category"
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setCurrentPage({ category: e.target.value, page: 1 });
                    }}
                    disabled={isLoading || isLoadingProducts}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {error && <div className="error-message">{error}</div>}
              {isLoadingProducts ? (
                <p>Loading products...</p>
              ) : (
                <>
                  {categories.map((category) => {
                    const categoryProducts = paginateProducts(filteredProducts, category);
                    const pageNumbers = getPageNumbers(category);

                    return (
                      <div key={category} className="category-section">
                        <h4>{category}</h4>
                        {categoryProducts.length > 0 ? (
                          <div className="product-cards">
                            {categoryProducts.map((product) => (
                              <div key={product.id} className="product-card">
                                <div className="product-image-container">
                                  <img
                                    src={getProductImage(product)}
                                    alt={product.name}
                                    className="product-image"
                                  />
                                </div>
                                <div className="product-info">
                                  <h4 className="product-name">{product.name}</h4>
                                  <p className="product-price">Price: ₱{parseFloat(product.price || 0).toFixed(2)}</p>
                                </div>
                                <div className="product-actions">
                                  <button
                                    type="button"
                                    className="edit-button"
                                    onClick={() => handleEditProduct(product)}
                                    disabled={isLoading}
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    className="delete-button"
                                    onClick={() => confirmDeleteProduct(product.id)}
                                    disabled={isLoading}
                                  >
                                    <Trash size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>No products available in this category.</p>
                        )}
                        {pageNumbers > 1 && (
                          <div className="pagination">
                            <button
                              onClick={() => paginate(category, currentPage.page - 1)}
                              disabled={currentPage.page === 1 || currentPage.category !== category}
                            >
                              Previous
                            </button>
                            {Array.from({ length: pageNumbers }, (_, i) => i + 1).map((number) => (
                              <button
                                key={number}
                                onClick={() => paginate(category, number)}
                                className={currentPage.page === number && currentPage.category === category ? 'active' : ''}
                                disabled={currentPage.category !== category}
                              >
                                {number}
                              </button>
                            ))}
                            <button
                              onClick={() => paginate(category, currentPage.page + 1)}
                              disabled={currentPage.page === pageNumbers || currentPage.category !== category}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "items" && (
          <div className="pos-section">
            <h3>Point of Sale</h3>
            <div className="cart-notifications">
              <h3>User Cart Notifications</h3>
              {notificationError && <p className="error-message">{notificationError}</p>}
              {aggregatedNotifications.length > 0 ? (
                <>
                  <ul className="notification-list">
                    {aggregatedNotifications.map((notification) => (
                      <li key={`${notification.user_id}_${notification.product_id}`} className="notification-item">
                        <div className="notification-details">
                          <span><strong>User:</strong> {notification.username}</span>
                          <span><strong>Product:</strong> {notification.product_name}</span>
                          <span><strong>Quantity:</strong> {notification.quantity}</span>
                          <span><strong>Total:</strong> ₱{parseFloat(notification.total || 0).toFixed(2)}</span>
                          <span><strong>Time:</strong> {new Date(notification.created_at).toLocaleString()}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="grand-total">
                    Grand Total: ₱{calculateGrandTotal()}
                  </div>
                </>
              ) : (
                <p>No cart additions recorded.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="users-section">
            <h3>Registered Users</h3>
            {userError && (
              <div className={`error-message ${userError.includes("successfully") ? "success-message" : ""}`}>
                {userError}
              </div>
            )}
            {users.length > 0 ? (
              <ul className="user-list">
                {users.map((user) => (
                  <li key={user.id} className="user-item">
                    <div className="user-details">
                      <span>{user.username}</span>
                      <span>{user.email}</span>
                      <span>{new Date(user.created_at).toLocaleString()}</span>
                    </div>
                    <div className="user-actions">
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => confirmDeleteUser(user.id)}
                        disabled={isLoading}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No users registered.</p>
            )}
          </div>
        )}

        {showModal && (
          <ConfirmationModal
            message={productToDelete ? "Are you sure you want to delete this product?" : "Are you sure you want to delete this user?"}
            onConfirm={productToDelete ? handleDeleteProductConfirmed : handleDeleteUser}
            onCancel={handleDeleteCancelled}
          />
        )}
      </div>
    </div>
  );
};