import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./Cart.css"; // Ensure you have this file for styling
import config from "../config";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState({}); // To store product details by productId

  // Retrieve user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user.userid : null;

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userId) {
        setError("Please log in to view your cart.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${config.url}/cart/${userId}`);
        setCartItems(response.data.products || []);
        setLoading(false);
        fetchProductDetails(response.data.products); // Fetch product details
      } catch (error) {
        console.error("Error fetching cart items:", error);
        setError("Failed to load cart items.");
        setLoading(false);
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

        setProductDetails(details); // Set the product details for later use
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchCartItems();
  }, [userId]);

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
      return total + (product?.originalPrice || 0) * item.quantity; // Use optional chaining
    }, 0).toFixed(2);
  };

  const handleProceedToBuy = () => {
    // Pass the cartItems as state to the Buy page
    navigate("/buy", { state: { cartItems, productDetails } });
  };

  const handleNavigateToOrders = () => {
    navigate("/orders"); // Navigate to the orders page
  };

  if (loading) {
    return <div>Loading cart items...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="cart-container">
      {/* Navigation Options */}
      <div className="navigation-options">
        <button onClick={() => navigate("/cart")}>Go to Cart</button>
        <button onClick={handleNavigateToOrders}>Go to Orders</button>
      </div>

      <h1>Your Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div key={item.productId} className="cart-item">
              {productDetails[item.productId]?.productImages && productDetails[item.productId].productImages.length > 0 ? (
                <img 
                src={`${config.url}${productDetails[item.productId].productImages[0]}`} 
                  alt={productDetails[item.productId].productName} 
                  onClick={() => window.location.href = `/viewproduct/${item.productId}`} // Redirect on image click
                  style={{ cursor: 'pointer' }}
                />
              ) : (
                <img src="/path/to/default/image.png" alt="Default" /> // Placeholder for missing images
              )}
              <div className="cart-item-details">
                <h3 
                  onClick={() => window.location.href = `/viewproduct/${item.productId}`} // Redirect on product name click
                  style={{ cursor: 'pointer' }}
                >
                  {productDetails[item.productId]?.productName || "Product Name Not Available"}
                </h3>
                <p>Price: ${productDetails[item.productId]?.originalPrice?.toFixed(2) || "N/A"}</p>
                <p>Quantity: {item.quantity}</p>
                <button onClick={() => deleteFromCart(item.productId)}>Remove</button>
              </div>
            </div>
          ))}
          <div className="total-price">
            <h2>Total Price: ${calculateTotalPrice()}</h2>
            <button className="proceed-to-buy" onClick={handleProceedToBuy}>Proceed to Buy</button> {/* Navigate to Buy page */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
