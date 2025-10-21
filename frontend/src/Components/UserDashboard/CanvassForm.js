// src/components/UserDashboard/CanvassForm.js
import React, { useState } from 'react';
import * as canvassService from '../../services/canvassService';
import '../../App.css'; // For form styling

function CanvassForm({ productId, productName }) {
    const [message, setMessage] = useState('');
    const [submitStatus, setSubmitStatus] = useState(''); // 'idle', 'loading', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus('loading');
        setErrorMessage('');

        if (!message.trim()) {
            setErrorMessage('Please enter your inquiry message.');
            setSubmitStatus('error');
            return;
        }

        try {
            await canvassService.submitCanvassRequest({ productId, message });
            setSubmitStatus('success');
            setMessage(''); // Clear message after successful submission
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
            setSubmitStatus('error');
        }
    };

    return (
        <div className="canvass-form-container">
            <h3>Send an Inquiry for {productName || 'General Inquiry'}</h3>
            <form onSubmit={handleSubmit} className="canvass-form">
                <div className="form-group">
                    <label htmlFor="canvassMessage">Your Message:</label>
                    <textarea
                        id="canvassMessage"
                        rows="5"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="e.g., 'Do you have this in other colors?', 'What is the bulk price for 100 units?', 'When will this be restocked?'"
                        required
                        disabled={submitStatus === 'loading'}
                    ></textarea>
                </div>

                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {submitStatus === 'success' && <p className="success-message">Your inquiry has been submitted successfully!</p>}

                <button type="submit" disabled={submitStatus === 'loading'} className="submit-button">
                    {submitStatus === 'loading' ? 'Submitting...' : 'Submit Inquiry'}
                </button>
            </form>
        </div>
    );
}

export default CanvassForm;