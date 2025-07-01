
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import "./Cart.css";
import config from "../config";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [updatingQuantity, setUpdatingQuantity] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user.userid : null;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userId) {
        setError("Please log in to view your cart.");
        setCartLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${config.url}/cart/${userId}`);
        setCartItems(response.data.products || []);
        setCartLoading(false);
        fetchProductDetails(response.data.products);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        setError("Failed to load cart items.");
        setCartLoading(false);
      }
    };

    const fetchProductDetails = async (products) => {
      const productIds = products.map(item => item.productId);
      try {
        const productRequests = productIds.map(id => 
          axios.get(`${config.url}/product/${id}`)
        );
        const productResponses = await Promise.all(productRequests);
        
        const details = productResponses.reduce((acc, curr) => {
          acc[curr.data.productId] = curr.data;
          return acc;
        }, {});

        setProductDetails(details);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchCartItems();
  }, [userId]);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingQuantity(prev => ({ ...prev, [productId]: true }));
    try {
      await axios.put(`${config.url}/cart/update`, {
        userId,
        productId,
        quantity: newQuantity,
      });
      setCartItems(prev => prev.map(item => 
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdatingQuantity(prev => ({ ...prev, [productId]: false }));
    }
  };

  const deleteFromCart = async (productId) => {
    try {
      await axios.delete(`${config.url}/${userId}/product/${productId}`);
      setCartItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
    } catch (error) {
      console.error("Error deleting product from cart:", error);
      setError("Failed to remove product from cart.");
    }
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const product = productDetails[item.productId];
      const price = product ? (product.originalPrice - (product.priceDiscount || 0)) : 0;
      return total + price * item.quantity;
    }, 0).toFixed(2);
  };

  const calculateOriginalTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = productDetails[item.productId];
      return total + (product?.originalPrice || 0) * item.quantity;
    }, 0).toFixed(2);
  };

  const calculateTotalSavings = () => {
    const original = parseFloat(calculateOriginalTotal());
    const current = parseFloat(calculateTotalPrice());
    return (original - current).toFixed(2);
  };

  const handleProceedToBuy = () => {
    navigate("/buy", { state: { cartItems, productDetails } });
  };

  const CartLoadingSkeleton = () => (
    <div className="cart-loading-container">
      <div className="cart-skeleton-header"></div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="cart-skeleton-item"></div>
      ))}
    </div>
  );

  if (cartLoading) return <CartLoadingSkeleton />;

  if (error) {
    return (
      <div className="cart-container">
        <div className="cart-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <div className="cart-header-content">
          <div className="cart-title-section">
            <ShoppingBag className="cart-header-icon" />
            <h1 className="cart-title">Your Shopping Cart</h1>
          </div>
          <div className="cart-item-count">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="cart-empty-state">
          <div className="cart-empty-icon">🛒</div>
          <h3 className="cart-empty-title">Your cart is empty</h3>
          <p className="cart-empty-description">Start shopping to add items to your cart</p>
          <button 
            className="cart-continue-shopping-btn"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-section">
            {cartItems.map((item) => {
              const product = productDetails[item.productId];
              if (!product) return null;
              
              const discountedPrice = product.originalPrice - (product.priceDiscount || 0);
              const itemTotal = discountedPrice * item.quantity;
              const originalItemTotal = product.originalPrice * item.quantity;
              const itemSavings = originalItemTotal - itemTotal;

              return (
                <div key={item.productId} className="cart-item">
                  <div className="cart-item-image-section">
                    <img 
                      src={product.productImages?.[0]} 
                      alt={product.productName}
                      className="cart-item-image"
                      onClick={() => navigate(`/viewproduct/${item.productId}`)}
                    />
                  </div>
                  
                  <div className="cart-item-details">
                    <div className="cart-item-info">
                      <h3 
                        className="cart-item-name"
                        onClick={() => navigate(`/viewproduct/${item.productId}`)}
                      >
                        {product.productName}
                      </h3>
                      <p className="cart-item-seller">Sold by {product.companyName}</p>
                      
                      <div className="cart-item-pricing">
                        <div className="cart-current-price">${discountedPrice.toLocaleString()}</div>
                        {product.priceDiscount > 0 && (
                          <>
                            <div className="cart-original-price">${product.originalPrice.toLocaleString()}</div>
                            <div className="cart-discount-percent">
                              {Math.round((product.priceDiscount / product.originalPrice) * 100)}% off
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="cart-item-controls">
                      <div className="cart-quantity-controls">
                        <button
                          className="cart-quantity-btn"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingQuantity[item.productId]}
                        >
                          <Minus className="cart-quantity-icon" />
                        </button>
                        <span className="cart-quantity-display">
                          {updatingQuantity[item.productId] ? '...' : item.quantity}
                        </span>
                        <button
                          className="cart-quantity-btn"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={updatingQuantity[item.productId]}
                        >
                          <Plus className="cart-quantity-icon" />
                        </button>
                      </div>

                      <button 
                        className="cart-remove-btn"
                        onClick={() => deleteFromCart(item.productId)}
                      >
                        <Trash2 className="cart-remove-icon" />
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-totals">
                    <div className="cart-item-total-price">${itemTotal.toLocaleString()}</div>
                    {itemSavings > 0 && (
                      <div className="cart-item-savings">You save ${itemSavings.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary-section">
            <div className="cart-summary">
              <h3 className="cart-summary-title">Order Summary</h3>
              
              <div className="cart-summary-details">
                <div className="cart-summary-row">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>${calculateOriginalTotal()}</span>
                </div>
                
                {parseFloat(calculateTotalSavings()) > 0 && (
                  <div className="cart-summary-row cart-savings">
                    <span>Total Savings</span>
                    <span>-${calculateTotalSavings()}</span>
                  </div>
                )}
                
                <div className="cart-summary-divider"></div>
                
                <div className="cart-summary-row cart-total">
                  <span>Total Amount</span>
                  <span>${calculateTotalPrice()}</span>
                </div>
              </div>

              <button 
                className="cart-proceed-btn"
                onClick={handleProceedToBuy}
              >
                Proceed to Checkout
                <ArrowRight className="cart-proceed-icon" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
