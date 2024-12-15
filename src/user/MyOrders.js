import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";
import "./MyOrders.css";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // React Router hook for navigation

  // Retrieve user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? Number(user.userid) : null; // Convert userId to a number

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setError("Please log in to view your orders.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${config.url}/orders/${userId}`);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const handleImageClick = (productId) => {
    navigate(`/viewproducty/${productId}`); // Redirect to the product's details page
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="my-orders-container">
      <h1>Your Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-item">
              <h2>Order ID: {order._id}</h2>
              <p>Total Amount: ${order.totalAmount.toFixed(2)}</p>
              <p>Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <h3>Products:</h3>
              <ul>
                {order.products.map((product, index) => (
                  <li key={index}>
                    <img
                      src={product.image ? `${config.url}${product.image}` : "/placeholder.jpg"} // Use placeholder if image is missing
                      alt={product.productId || "Product Image"}
                      style={{ cursor: "pointer", width: "100px", height: "100px" }}
                      onClick={() => handleImageClick(product.productId)} // Click handler
                    />
                    {product.productId} - Quantity: {product.quantity}
                  </li>
                ))}
              </ul>
              <h3>Payment Details:</h3>
              <p>Payment ID: {order.paymentDetails.paymentId}</p>
              <p>Capture Time: {new Date(order.paymentDetails.captureTime).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
