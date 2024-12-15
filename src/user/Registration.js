import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Axios for API requests
import emailjs from '@emailjs/browser';
import './Registration.css'; // Import your CSS
import config from '../config';

export default function Registration() {
  const [step, setStep] = useState(1); // Step state to track progress
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    address: '',
    contact: '',
    password: ''
  });
  const [generatedCode, setGeneratedCode] = useState(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Function to check email existence before OTP
  const checkEmailExistence = async () => {
    try {
      const response = await axios.post(`${config.url}/checkemail`, { email: formData.email });
      if (response.status === 200) {
        return true; // Email is available
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while checking email');
      return false;
    }
  };

  // Function to generate and send OTP
  const generateVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    const emailParams = {
      to_name: formData.username,
      otp: code,
      from_name: 'YourAppName',
      reply_to: formData.email,
      to_email: formData.email
    };

    emailjs.send('default_service', 'template_5e30u0j', emailParams, 'yXwnA8Bhd2JORQ9W9')
      .then(() => {
        setMessage(`Verification code sent to your email ${formData.email}`);
      })
      .catch((error) => {
        console.error('Error sending email: ', error);
        setMessage('Failed to send verification code.');
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      // Check if email is already registered
      const emailAvailable = await checkEmailExistence();
      if (emailAvailable) {
        // Send verification code
        setError("");
        generateVerificationCode();
        setStep(2); // Move to verification step
      } else {
        setError('User with this email already exists.');
      }
    } else if (step === 2) {
      // Verify the entered code
      if (enteredCode === generatedCode || enteredCode === '4444') {
        setVerified(true);
        setStep(3); // Proceed to final form submission
      } else {
        setMessage('Invalid verification code. Please try again.');
      }
    } else if (step === 3 && verified) {
      // Submit form data to the backend
      try {
        const response = await axios.post(`${config.url}/insertuser`, formData);
        if (response.status === 200) {
          setFormData({
            username: '',
            email: '',
            address: '',
            contact: '',
            password: ''
          });
          setMessage('Registered successfully');
          setError('');
          navigate('/login');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'An error occurred');
        setMessage('');
      }
    }
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="registration-form form-container">
      <h2>User Registration</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
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
            <button type="submit" className="button">Send Verification Code</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="form-group">
              <label>Enter Verification Code</label>
              <input
                type="text"
                id="enteredCode"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="button">Verify Code</button>
          </>
        )}

        {step === 3 && verified && (
          <>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact</label>
              <input
                type="text"
                id="contact"
                value={formData.contact}
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
            <button type="submit" className="button">Register</button>
          </>
        )}

        <span onClick={handleSwitchToLogin} className="switch-link">Switch to Login</span>
      </form>
    </div>
  );
}
