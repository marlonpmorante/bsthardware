// src/components/AdminDashboard/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import AdminProductList from './AdminProductList'; // Component to list and manage products
import CanvassRequestsList from './CanvassRequestsList'; // Component to manage requests
import '../../App.css'; // For styling

function AdminDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'canvass'

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Admin Panel - Welcome, {user.name}!</h1>
                <button onClick={logout} className="logout-button">Logout</button>
            </header>

            <nav className="admin-tabs">
                <button
                    className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    Product Management
                </button>
                <button
                    className={`tab-button ${activeTab === 'canvass' ? 'active' : ''}`}
                    onClick={() => setActiveTab('canvass')}
                >
                    Canvass Requests
                </button>
                {/* Add more tabs for other admin features */}
            </nav>

            <div className="admin-content">
                {activeTab === 'products' && (
                    <>
                        <div className="admin-actions">
                            <Link to="/admin/products/add" className="add-button">Add New Product</Link>
                        </div>
                        <AdminProductList />
                    </>
                )}
                {activeTab === 'canvass' && (
                    <CanvassRequestsList />
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;