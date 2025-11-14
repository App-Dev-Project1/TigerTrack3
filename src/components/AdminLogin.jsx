// src/components/AdminLogin.jsx

import React, { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import tigerLogo from '../assets/tiger.png'; 
import cicsBuilding from '../assets/cics.png';
import './AdminLogin.css'; // Using the CSS file you provided
import { supabase } from '../supabaseClient'; // Import Supabase

const AdminLogin = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // --- THIS FUNCTION IS NOW ASYNC AND USES SUPABASE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    // Supabase login logic
    const { data, error }  = await supabase.auth.signInWithPassword({
      email: formData.username, // Supabase uses email for auth
      password: formData.password,
    });

    setLoading(false);

    if (error) {
      setError(error.message); // Show the real error from Supabase
    } else {
      // Login was successful
      navigate('/admin-dashboard');
    }
  };

  return (
    <div className="admin-login-page">

      {/* Back button */}
      <button 
        className="admin-back-btn"
        onClick={() => navigate('/')}
      >
        ← Back
      </button>

      {/* LEFT SIDE - Tiger Logo + TigerTrack */}
      <div className="admin-login-left">
        <img src={tigerLogo} alt="TigerTrack Logo" className="admin-tiger-logo" />
        <h1 className="admin-welcome-text">TigerTrack</h1>
        <p className="admin-welcome-subtext">
          UST-CICS Lost & Found System<br/>
          Secure Administrator Portal
        </p>
      </div>

      {/* CICS Logo in Circle - Top Right */}
      <div className="cics-circle-container">
        <div className="cics-circle">
          <img 
            src={cicsBuilding} 
            alt="CICS Logo" 
            className="cics-building-img" 
          />
        </div>
      </div>

      {/* RIGHT SIDE - Login Card WITH Red Header */}
      <Card className="admin-login-card">
        
        {/* Header with Administrator Access */}
        <div className="admin-login-header">
          <h5 className="admin-login-heading">Administrator Access</h5>
          <p className="admin-login-text">Please log in with your admin credentials.</p>
        </div>

        <Card.Body className="admin-login-body">

          {error && (
            <Alert 
              variant="danger" 
              dismissible 
              onClose={() => setError('')} 
              className="admin-login-alert"
            >
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="admin-login-label">Email Address</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="admin-login-input"
                placeholder="Admin Email Address" // Updated placeholder
                disabled={loading}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="admin-login-label">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="admin-login-input"
                placeholder="Password"
                disabled={loading}
                required
              />
            </Form.Group>

            <Button 
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>

          <div className="admin-login-note">
            <strong>Note:</strong><br />
            Please use the admin email and password you created in the Supabase Authentication {">"} Users panel.
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminLogin;