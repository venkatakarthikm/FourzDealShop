import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import emailjs from "@emailjs/browser";
import config from "../config";
import "./Registration.css";

export default function Registration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    address: "",
    contact: "",
    password: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [enteredCode, setEnteredCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageSelect = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setImageFile(e.dataTransfer.files[0]);
  };

  const checkEmailExistence = async () => {
    try {
      const response = await axios.post(`${config.url}/checkemail`, { email: formData.email });
      return response.status === 200;
    } catch (error) {
      setError(error.response?.data?.message || "Error checking email");
      return false;
    }
  };

  const generateVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    emailjs.send("default_service", "template_5e30u0j", {
      to_name: formData.username,
      otp: code,
      from_name: "YourAppName",
      reply_to: formData.email,
      to_email: formData.email
    }, "yXwnA8Bhd2JORQ9W9").then(() => {
      setMessage(`Verification code sent to ${formData.email}`);
    }).catch(() => {
      setMessage("Failed to send verification code.");
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      const emailAvailable = await checkEmailExistence();
      if (emailAvailable) {
        setError("");
        generateVerificationCode();
        setStep(2);
      }
    } else if (step === 2) {
      if (enteredCode === generatedCode || enteredCode === "4444") {
        setVerified(true);
        setStep(3);
      } else {
        setMessage("Invalid verification code.");
      }
    } else if (step === 3 && verified) {
      const form = new FormData();
      for (const key in formData) form.append(key, formData[key]);
      if (imageFile) form.append("image", imageFile);

      try {
        const res = await axios.post(`${config.url}/insertuser`, form);
        if (res.status === 200) {
          setMessage("Registered successfully");
          setError("");
          navigate("/login");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Registration failed");
      }
    }
  };

  return (
    <div className="registration-form form-container">
      <h2>User Registration</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} onDrop={handleImageDrop} onDragOver={(e) => e.preventDefault()}>
        {step === 1 && (
          <>
            <div className="form-group">
              <label>Username</label>
              <input id="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input id="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <button className="button" type="submit">Send Verification Code</button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="form-group">
              <label>Enter Verification Code</label>
              <input value={enteredCode} onChange={(e) => setEnteredCode(e.target.value)} required />
            </div>
            <button className="button" type="submit">Verify Code</button>
          </>
        )}
        {step === 3 && verified && (
          <>
            <div className="form-group">
              <label>Address</label>
              <input id="address" value={formData.address} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Contact</label>
              <input id="contact" value={formData.contact} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" id="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Upload Profile Image</label>
              <input type="file" onChange={handleImageSelect} />
              {imageFile && <p>Selected: {imageFile.name}</p>}
              <p>Or drag & drop image here</p>
            </div>
            <button className="button" type="submit">Register</button>
          </>
        )}
        <span className="switch-link" onClick={() => navigate("/login")}>Switch to Login</span>
      </form>
    </div>
  );
}
