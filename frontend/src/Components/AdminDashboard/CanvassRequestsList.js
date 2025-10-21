// src/components/AdminDashboard/CanvassRequestsList.js
import React, { useEffect, useState } from 'react';
import * as canvassService from '../../services/canvassService';
import '../../App.css'; // For styling

function CanvassRequestsList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await canvassService.getCanvassRequests();
            setRequests(data);
        } catch (err) {
            setError('Failed to load canvass requests.');
            console.error('Canvass requests fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        // You might consider WebSocket for real-time updates on new requests or status changes here too
    }, []);

    const handleStatusChange = async (requestId, newStatus) => {
        if (!window.confirm(`Are you sure you want to change the status to '${newStatus}'?`)) {
            return;
        }
        try {
            await canvassService.updateCanvassRequestStatus(requestId, newStatus);
            // Update the local state or re-fetch to reflect the change
            setRequests(prev => prev.map(req =>
                req.id === requestId ? { ...req, status: newStatus } : req
            ));
        } catch (err) {
            alert('Failed to update request status: ' + (err.response?.data?.message || err.message));
            console.error('Error updating canvass request status:', err);
        }
    };

    if (loading) return <div className="loading-message">Loading canvass requests...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="canvass-requests-list">
            <h2 className="section-title">Canvass Requests</h2>
            {requests.length === 0 ? (
                <p>No canvass requests found.</p>
            ) : (
                <div className="requests-table-container">
                    <table className="requests-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Product</th>
                                <th>Message</th>
                                <th>Status</th>
                                <th>Requested On</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(request => (
                                <tr key={request.id}>
                                    <td>{request.id}</td>
                                    <td>{request.user_name} ({request.user_email})</td>
                                    <td>{request.product_name || 'General Inquiry'}</td>
                                    <td>{request.message}</td>
                                    <td>
                                        <select
                                            value={request.status}
                                            onChange={(e) => handleStatusChange(request.id, e.target.value)}
                                            className={`status-select status-${request.status}`}
                                            disabled={loading}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="responded">Responded</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </td>
                                    <td>{new Date(request.created_at).toLocaleString()}</td>
                                    <td>
                                        {/* You can add more actions here, like "View Details" or "Contact User" */}
                                        <button className="action-button view">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default CanvassRequestsList;