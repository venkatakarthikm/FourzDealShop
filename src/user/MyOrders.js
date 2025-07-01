
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Package, Calendar, CreditCard, Eye } from 'lucide-react';
import config from "../config";
import "./MyOrders.css";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? Number(user.userid) : null;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setError("Please log in to view your orders.");
        setOrdersLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${config.url}/orders/${userId}`);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders.");
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const handleImageClick = (productId) => {
    navigate(`/viewproduct/${productId}`);
  };

  const OrdersLoadingSkeleton = () => (
    <div className="orders-loading-container">
      <div className="orders-skeleton-header"></div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="orders-skeleton-card"></div>
      ))}
    </div>
  );

  if (ordersLoading) return <OrdersLoadingSkeleton />;

  if (error) {
    return (
      <div className="orders-container">
        <div className="orders-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div className="orders-header-content">
          <div className="orders-title-section">
            <Package className="orders-header-icon" />
            <h1 className="orders-title">Your Orders</h1>
          </div>
          <div className="orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty-state">
          <div className="orders-empty-icon">📦</div>
          <h3 className="orders-empty-title">No orders found</h3>
          <p className="orders-empty-description">You haven't placed any orders yet</p>
          <button 
            className="orders-continue-shopping-btn"
            onClick={() => navigate('/products')}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="orders-item">
              <div className="orders-item-header">
                <div className="orders-item-info">
                  <div className="orders-id-section">
                    <h3 className="orders-id">Order #{order._id.slice(-8)}</h3>
                    <div className="orders-date">
                      <Calendar className="orders-date-icon" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="orders-amount">
                    <span className="orders-amount-label">Total Amount</span>
                    <span className="orders-amount-value">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="orders-products-section">
                <h4 className="orders-products-title">Products ({order.products.length})</h4>
                <div className="orders-products-list">
                  {order.products.map((product, index) => (
                    <div key={index} className="orders-product-item">
                      <div className="orders-product-image-container">
                        <img
                          src={product.image || "/placeholder.jpg"}
                          alt={product.productId || "Product"}
                          className="orders-product-image"
                          onClick={() => handleImageClick(product.productId)}
                        />
                      </div>
                      <div className="orders-product-details">
                        <div className="orders-product-name">Product ID: {product.productId}</div>
                        <div className="orders-product-quantity">Quantity: {product.quantity}</div>
                      </div>
                      <button
                        className="orders-view-product-btn"
                        onClick={() => handleImageClick(product.productId)}
                      >
                        <Eye className="orders-view-icon" />
                        View Product
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="orders-payment-section">
                <h4 className="orders-payment-title">
                  <CreditCard className="orders-payment-icon" />
                  Payment Details
                </h4>
                <div className="orders-payment-details">
                  <div className="orders-payment-row">
                    <span className="orders-payment-label">Payment ID:</span>
                    <span className="orders-payment-value">{order.paymentDetails.paymentId}</span>
                  </div>
                  <div className="orders-payment-row">
                    <span className="orders-payment-label">Capture Time:</span>
                    <span className="orders-payment-value">
                      {new Date(order.paymentDetails.captureTime).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
