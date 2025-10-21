import React from 'react';
import './Logout.css';

const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Are you sure you want to log out?</h3>
        <div className="modal-actions">
          <button className="modal-button confirm" onClick={onConfirm}>
            Yes
          </button>
          <button className="modal-button cancel" onClick={onCancel}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;