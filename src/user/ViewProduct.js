import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ViewProduct.css";
import config from "../config";

const ViewProduct = () => {
  const { productId } = useParams(); // Get productId from URL
  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartMessage, setCartMessage] = useState(""); // Message after adding to cart
  const [quantity, setQuantity] = useState(1); // New state for quantity

  // Retrieve user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user.userid : null; // Get userId from the user object
  console.log(
    "UserId:",
    userId,
    "ProductId:",
    productId,
    "Quantity:",
    quantity
  );

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`${config.url}/product/${productId}`);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError("Failed to load product details.");
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };

  const addToCart = async () => {
    if (!userId) {
      setCartMessage("Please log in to add products to the cart.");
      return;
    }

    try {
      const response = await axios.post(`${config.url}/cart/add`, {
        userId,
        productId,
        quantity, // Send the selected quantity
      });
      setCartMessage("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding product to cart:", error);
      setCartMessage("Failed to add product to cart.");
    }
  };

  const increaseQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1)); // Prevent negative quantity
  };

  if (loading) {
    return <div>Loading product details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const discountedPrice = (
    product.originalPrice - product.priceDiscount
  ).toFixed(2);

  return (
    <div className="view-product-container">
      <h1>{product.productName}</h1>
      <div className="product-content">
        <div className="product-images">
          <div className="thumbnails">
            {product.productImages.map((image, index) => (
              <img
                key={index}
                src={`${config.url}${image}`} // Ensure a slash between base URL and image path
                alt={`${product.productName} thumbnail`}
                className={`thumbnail-image ${
                  index === selectedImageIndex ? "active" : ""
                }`}
                onClick={() => handleThumbnailClick(index)}
              />
            ))}
          </div>
          <div className="main-image">
            <img
              src={`${config.url}${product.productImages[selectedImageIndex]}`} // Ensure proper URL format
              alt={product.productName}
              className="main-product-image" // Add a class for main image styling if needed
            />
          </div>
        </div>

        <div className="product-details">
          <p className="price">Price: ${product.originalPrice.toFixed(2)}</p>
          {product.priceDiscount > 0 && (
            <>
              <p className="discounted-price">
                Discounted Price: ${discountedPrice}
              </p>
              <p className="you-save">
                You save: ${product.priceDiscount.toFixed(2)}
              </p>
            </>
          )}
          <p className="description">{product.productDescription}</p>

          {/* Quantity Selector */}
          <div className="quantity-selector">
            <button onClick={decreaseQuantity}>-</button>
            <span>{quantity}</span> {/* Display selected quantity */}
            <button onClick={increaseQuantity}>+</button>
          </div>

          <div className="buttons">
            <button
              className="buy-now"
              onClick={() =>
                (window.location.href = `/buy/${product.productId}`)
              }
            >
              Buy Now
            </button>
            <button className="add-to-cart" onClick={addToCart}>
              Add to Cart
            </button>
          </div>
          {/* Cart message */}
          {cartMessage && <p className="cart-message">{cartMessage}</p>}
        </div>
      </div>
      <div className="reviews-section">
        <h2>Reviews</h2>
        <p>No reviews yet.</p>
      </div>
    </div>
  );
};

export default ViewProduct;
