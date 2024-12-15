import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import './Login.css'; // Import your CSS file

export default function Login({ onUserLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${config.url}/checkuserlogin`, formData);
      if (response.data != null) {
        onUserLogin();
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate("/");
      } else {
        setMessage("Login Failed");
        setError("");
      }
    } catch (error) {
      setMessage("");
      setError(error.message);
    }
  };

  const handleSwitchToRegister = () => {
    navigate('/registration');
  };

  return (
    <div className="login-form form-container">
      <h2>User Login</h2>
      {message ? (
        <p className="success-message">{message}</p>
      ) : (
        <p className="error-message">{error}</p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="button">Login</button>
        <span 
          onClick={handleSwitchToRegister} 
          className="switch-link">
          Switch to Registration
        </span>
      </form>
    </div>
  );
}
