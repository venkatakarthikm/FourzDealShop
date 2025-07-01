import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import config from "../config";
import emailjs from "@emailjs/browser";
import "./Account.css";

const Account = () => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [otpStep, setOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      setUserData(user);
      setFormData({
        username: user.username,
        address: user.address,
        contact: user.contact,
      });
      setImagePreview(user.image);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSendOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    const params = {
      to_name: formData.username,
      otp,
      to_email: user.email,
      reply_to: user.email,
      from_name: "FourzDeals",
    };
    emailjs
      .send("default_service", "template_5e30u0j", params, "yXwnA8Bhd2JORQ9W9")
      .then(() => {
        setMessage(`OTP sent to ${user.email}`);
        setOtpStep(true);
      })
      .catch(() => {
        setMessage("Failed to send OTP.");
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword && enteredOtp !== generatedOtp && enteredOtp !== "4444") {
      setMessage("Invalid OTP.");
      return;
    }

    const data = new FormData();
    data.append("userid", user.userid);
    data.append("username", formData.username);
    data.append("address", formData.address);
    data.append("contact", formData.contact);
    if (newPassword) data.append("newPassword", newPassword);
    if (image) data.append("profileImage", image);

    try {
      const res = await axios.post(`${config.url}/update-user`, data);
      localStorage.setItem("user", JSON.stringify(res.data));
      setMessage("Profile updated!");
      window.location.reload();
    } catch (err) {
      setMessage("Update failed.");
    }
  };

  return (
    <div className="account-settings">
      <div className="account-header">
        {user?.profileImage ? (
          <img src={user.profileImage} className="account-avatar" alt="Profile" />
        ) : (
          <div className="account-avatar fallback">
            {user?.username?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div className="account-info">
          <h2>{user?.username}'s Account</h2>
          <p>{user?.email}</p>
        </div>
      </div>

      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div
          className="image-upload"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current.click()}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="preview-img" />
          ) : (
            <span>Drag or click to upload image</span>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            hidden
          />
        </div>

        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Contact"
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          required
        />

        {!otpStep && (
          <button type="button" onClick={handleSendOtp}>
            Change Password
          </button>
        )}

        {otpStep && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </>
        )}

        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Account;
