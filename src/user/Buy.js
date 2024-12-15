import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import "./Buy.css";
import config from "../config";

// Animation Component
const SuccessAnimation = () => (
  <div className="content">
    <svg width="400" height="400">
      <circle
        fill="none"
        stroke="#68E534"
        strokeWidth="20"
        cx="200"
        cy="200"
        r="190"
        strokeLinecap="round"
        transform="rotate(-90 200 200)"
        className="circle"
      />
      <polyline
        fill="none"
        stroke="#68E534"
        points="88,214 173,284 304,138"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="tick"
      />
    </svg>
    <div className="order-text">Order Placed!</div>
  </div>
);

const Buy = () => {
  const location = useLocation();
  const { cartItems, productDetails } = location.state || {};

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user.userid.toString() : null; // Ensure userId is a string

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (cartItems) {
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

  const handleUserDetailsChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUserDetailsSave = async () => {
    try {
      await axios.put(`${config.url}/user/${userId}`, userData);
      setMessage("User details updated successfully!");
    } catch (error) {
      setMessage("Error updating user details. Please try again.");
    }
  };

  const handleRemoveProduct = (productId) => {
    const updatedCartItems = cartItems.filter(
      (item) => item.productId !== productId
    );
    const total = updatedCartItems.reduce((sum, item) => {
      const productPrice = productDetails[item.productId]?.originalPrice || 0;
      return sum + item.quantity * productPrice;
    }, 0);
    setTotalAmount(total);
  };

  const handleSuccessPayment = async (details) => {
    try {
      if (details.status === "COMPLETED") {
        const orderData = {
          userId: Number(userId),
          products: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            image: productDetails[item.productId]?.productImages[0], // Add image URL
            seller: productDetails[item.productId]?.companyName || "Unknown Seller", // Ensure seller is added
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
  
        setIsLoading(true); // Start loading animation
  
        // Send request to backend to store order
        await axios.post(`${config.url}/orders/add`, orderData);
  
        // Update payment and order states
        setPaymentComplete(true);
        setOrderPlaced(true);
  
        // Wait for 2 seconds to show the order is placed
        setTimeout(() => {
          setIsLoading(false);
          window.location.href = "/orders"; // Redirect to orders page
        }, 2000);
      } else {
        setMessage("Payment was not successful. Please try again.");
      }
    } catch (error) {
      setMessage("Failed to place the order. Please try again.");
    }
  };
   

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

  return (
    <div className="buy-checkout-container">
      <h2>Checkout Page</h2>
      {message && <div className="buy-message">{message}</div>}

      {orderPlaced ? (
        <SuccessAnimation />
      ) : (
        <>
          <div className="progress-tracker">
            <div className={`circle green`}>1</div>
            <div className={`circle ${paymentComplete ? "green" : "red"}`}>2</div>
          </div>

          <div className="buy-user-info">
            <h3>Update Your Details</h3>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleUserDetailsChange}
                className="buy-input"
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleUserDetailsChange}
                className="buy-input"
              />
            </label>
            <label>
              Address:
              <input
                type="text"
                name="address"
                value={userData.address}
                onChange={handleUserDetailsChange}
                className="buy-input"
              />
            </label>
          </div>

          <div className="buy-order-summary">
            <h3>Order Summary</h3>
            <p>
              Please review your order details below before proceeding with the
              payment:
            </p>
            <div className="buy-product-list">
              {cartItems.map((item) => (
                <div key={item.productId} className="buy-product-item">
                  <img
                    src={`${config.url}${productDetails[item.productId]?.productImages[0]}`}
                    alt={productDetails[item.productId]?.productName}
                    className="buy-product-image"
                  />
                  <div className="buy-product-details">
                    <h4 className="buy-product-name">
                      {productDetails[item.productId]?.productName || "Product Name Not Available"}
                    </h4>
                    <p className="buy-product-price">
                      Price: ${productDetails[item.productId]?.originalPrice?.toFixed(2) || "N/A"}
                    </p>
                    <p className="buy-product-quantity">
                      Quantity: {item.quantity}
                    </p>
                    <p className="buy-product-quantity">
                      Seller: {item.companyName}
                    </p>
                    <button
                      onClick={() => handleRemoveProduct(item.productId)}
                      className="buy-remove-button"
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="buy-total">Total: ${totalAmount.toFixed(2)}</p>
          </div>

          <PayPalScriptProvider
            options={{
              "client-id": config.paypal.clientId,
              currency: config.paypal.currency,
            }}
          >
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={createOrder}
              onApprove={(data, actions) => {
                return actions.order.capture().then((details) => {
                  localStorage.setItem('payment', JSON.stringify(details));
                  handleSuccessPayment(details);
                });
              }}
              onError={(err) => {
                setMessage("Payment failed. Please try again.");
              }}
            />
          </PayPalScriptProvider>
        </>
      )}
    </div>
  );
};

export default Buy;
