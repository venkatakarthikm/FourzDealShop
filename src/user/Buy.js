
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import "./Buy.css";
import config from "../config";

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner">
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
    </div>
    <p className="loading-text">Processing your payment...</p>
  </div>
);

// Success Animation Component
const SuccessAnimation = () => (
  <div className="success-container">
    <div className="success-checkmark-container">
      <svg className="success-checkmark" viewBox="0 0 100 100">
        <circle
          className="success-circle"
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          className="success-tick"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M25 50 L40 65 L75 35"
        />
      </svg>
    </div>
    <h2 className="success-title">Payment Successful!</h2>
    <p className="success-message">Your order has been placed successfully</p>
    <div className="success-confetti">
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
    </div>
  </div>
);

// Progress Step Component
const ProgressStep = ({ step, currentStep, label }) => (
  <div className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
    <div className="progress-circle">
      {currentStep > step ? '✓' : step}
    </div>
    <span className="progress-label">{label}</span>
  </div>
);

const Buy = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get state from navigation
  const { cartItems: initialCartItems = [], productDetails = {}} = location.state || {};

  // Ensure cartItems is always an array
  const [cartItems, setCartItems] = useState(initialCartItems);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? String(user.userid) : null;

  // User data for checkout
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
  });

  // Total amount of selected items
  const [totalAmount, setTotalAmount] = useState(0);

  // UI states
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize total amount and user details
  useEffect(() => {
    if (Array.isArray(cartItems)) {
      const total = cartItems.reduce((sum, item) => {
        const productPrice = productDetails[item.productId]?.originalPrice || 0;
        return sum + item.quantity * productPrice;
      }, 0);
      setTotalAmount(total);
    }

    if (user) {
      setUserData({
        name: user.username,
        email: user.email,
        address: user.address,
      });
    }
  }, [cartItems, productDetails, user]);

  // Handle input changes in user info form
  const handleUserDetailsChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Allow removing product but ensure at least one remains
  const handleRemoveProduct = (productId) => {
    if (cartItems.length === 1) {
      setMessage("You must have at least one item to proceed.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const updatedCartItems = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCartItems);

    const total = updatedCartItems.reduce((sum, item) => {
      const productPrice = productDetails[item.productId]?.originalPrice || 0;
      return sum + item.quantity * productPrice;
    }, 0);
    setTotalAmount(total);
  };

  // Handle payment success and place order
  const handleSuccessPayment = async (details) => {
    try {
      if (details.status === "COMPLETED") {
        setCurrentStep(2);
        setIsLoading(true);

        const orderData = {
          userId: Number(userId),
          products: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            image: productDetails[item.productId]?.productImages[0],
            seller: productDetails[item.productId]?.companyName || "Unknown Seller",
          })),
          totalAmount: totalAmount,
          userData,
          paymentDetails: {
            paymentId: details.id,
            captureTime: details.purchase_units[0].payments.captures[0].update_time,
            amount: parseFloat(details.purchase_units[0].payments.captures[0].amount.value),
            currency: details.purchase_units[0].payments.captures[0].amount.currency_code,
          },
        };

        await axios.post(`${config.url}/orders/add`, orderData);
        
        setTimeout(() => {
          setIsLoading(false);
          setShowSuccess(true);
          setCurrentStep(3);
        }, 2000);

        setTimeout(() => {
          navigate("/orders");
        }, 4000);
      } else {
        setMessage("Payment was not successful. Please try again.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setMessage("Failed to place the order. Please try again.");
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Create PayPal order
  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: totalAmount.toFixed(2),
          },
        },
      ],
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (showSuccess) {
    return <SuccessAnimation />;
  }

  return (
    <div className="buy-checkout-container">
      <div className="checkout-header">
        <h1 className="checkout-title">Secure Checkout</h1>
        <div className="progress-bar">
          <ProgressStep step={1} currentStep={currentStep} label="Details" />
          <div className="progress-line"></div>
          <ProgressStep step={2} currentStep={currentStep} label="Payment" />
          <div className="progress-line"></div>
          <ProgressStep step={3} currentStep={currentStep} label="Complete" />
        </div>
      </div>

      {message && (
        <div className="message-alert">
          <span className="alert-icon">⚠️</span>
          {message}
        </div>
      )}

      <div className="checkout-content">
        <div className="checkout-left">
          <div className="user-details-section">
            <h3 className="section-title">
              <span className="section-icon">👤</span>
              Delivery Information
            </h3>
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleUserDetailsChange}
                  className="styled-input"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleUserDetailsChange}
                  className="styled-input"
                  placeholder="Enter your email"
                />
              </div>
              <div className="input-group full-width">
                <label className="input-label">Delivery Address</label>
                <input
                  type="text"
                  name="address"
                  value={userData.address}
                  onChange={handleUserDetailsChange}
                  className="styled-input"
                  placeholder="Enter your complete address"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="checkout-right">
          <div className="order-summary-section">
            <h3 className="section-title">
              <span className="section-icon">🛒</span>
              Order Summary
            </h3>
            
            <div className="product-list">
              {cartItems.map((item, index) => (
                <div key={item.productId} className="pc" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="product-image-container">
                    <img
                      src={`${productDetails[item.productId]?.productImages[0]}`}
                      alt={productDetails[item.productId]?.productName}
                      className="product-image"
                    />
                  </div>
                  <div className="product-info">
                    <h4 className="product-name">
                      {productDetails[item.productId]?.productName || "Product Name Not Available"}
                    </h4>
                    <p className="product-seller">
                      by {productDetails[item.productId]?.companyName || "Unknown Seller"}
                    </p>
                    <div className="product-pricing">
                      <span className="product-price">
                        ${productDetails[item.productId]?.originalPrice?.toFixed(2) || "N/A"}
                      </span>
                      <span className="product-quantity">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  {cartItems.length > 1 && (
                    <button
                      onClick={() => handleRemoveProduct(item.productId)}
                      className="remove-button"
                      title="Remove item"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="order-total">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span className="free-shipping">Free</span>
              </div>
              <div className="total-row total-final">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="payment-section">
              <h4 className="payment-title">Complete Your Payment</h4>
              <PayPalScriptProvider
                options={{
                  "client-id": config.paypal.clientId,
                  currency: config.paypal.currency,
                }}
              >
                <div className="paypal-container">
                  <PayPalButtons
                    style={{ 
                      layout: "vertical",
                      color: "blue",
                      shape: "rect",
                      label: "paypal",
                      height: 45
                    }}
                    createOrder={createOrder}
                    onApprove={(data, actions) => {
                      return actions.order.capture().then((details) => {
                        localStorage.setItem('payment', JSON.stringify(details));
                        handleSuccessPayment(details);
                      });
                    }}
                    onError={() => {
                      setMessage("Payment failed. Please try again.");
                      setTimeout(() => setMessage(""), 3000);
                    }}
                  />
                </div>
              </PayPalScriptProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Buy;
