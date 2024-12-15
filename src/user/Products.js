import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Products.css"; // For styling
import config from "../config"; // Ensure config.url is the correct base URL

const Products = () => {
  const [products, setProducts] = useState([]);
  const [imageIndexes, setImageIndexes] = useState({});
  const [cartMessages, setCartMessages] = useState({}); // Store messages for each product

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user.userid : null;

  // Add to cart
  const addToCart = async (productId) => {
    if (!userId) {
      setCartMessages((prevMessages) => ({
        ...prevMessages,
        [productId]: "Please log in to add products to the cart.",
      }));
      return;
    }

    try {
      const quantity = 1;
      const response = await axios.post(`${config.url}/cart/add`, {
        userId,
        productId,
        quantity,
      });
      setCartMessages((prevMessages) => ({
        ...prevMessages,
        [productId]: "Product added to cart successfully!",
      }));
    } catch (error) {
      setCartMessages((prevMessages) => ({
        ...prevMessages,
        [productId]: "Failed to add product to cart.",
      }));
    }
  };

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${config.url}/products`);
        setProducts(response.data);
        // Initialize each product's current image index to 0
        const initialIndexes = response.data.reduce((acc, product) => {
          acc[product.productId] = 0;
          return acc;
        }, {});
        setImageIndexes(initialIndexes);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Handle next image for the slider
  const nextImage = (productId, imagesLength) => {
    setImageIndexes((prevIndexes) => ({
      ...prevIndexes,
      [productId]: (prevIndexes[productId] + 1) % imagesLength,
    }));
  };

  // Handle previous image for the slider
  const prevImage = (productId, imagesLength) => {
    setImageIndexes((prevIndexes) => ({
      ...prevIndexes,
      [productId]: (prevIndexes[productId] - 1 + imagesLength) % imagesLength,
    }));
  };

  return (
    <div className="home-container">
      <h1>Our Products</h1>
      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.productId}>
            <div className="image-slider">
              {/* Arrows */}
              <button
                className="arrow left-arrow"
                onClick={() =>
                  prevImage(product.productId, product.productImages.length)
                }
              >
                &#8249;
              </button>

              <img
                src={`${config.url}${product.productImages[imageIndexes[product.productId]]}`}
                alt={product.productName}
                className="product-image"
              />

              <button
                className="arrow right-arrow"
                onClick={() =>
                  nextImage(product.productId, product.productImages.length)
                }
              >
                &#8250;
              </button>
            </div>
            <h2 className="product-name">{product.productName}</h2>

            {/* Description with fixed length */}
            <p className="product-description">
              {product.productDescription.length > 100
                ? product.productDescription.slice(0, 100) + "..."
                : product.productDescription}
            </p>

            {/* Pricing */}
            {product.priceDiscount > 0 ? (
              <div className="product-pricing">
                <span className="product-original-price">
                  <s>${product.originalPrice}</s>
                </span>
                <span className="product-discounted-price">
                  ${product.originalPrice - product.priceDiscount}
                </span>
                <span className="product-savings">
                  You save ${product.priceDiscount}
                </span>
              </div>
            ) : (
              <div className="product-pricing">
                <span className="product-discounted-price">
                  ${product.originalPrice}
                </span>
              </div>
            )}

            {/* Buy and Like Buttons */}
            <div className="product-actions">
              <button
                className="buy-btn"
                onClick={() =>
                  (window.location.href = `/viewproduct/${product.productId}`)
                }
              >
                Buy
              </button>
              <button
                className="like-btn"
                onClick={() => addToCart(product.productId)}
              >
                Cart
              </button>
            </div>
            {/* Show message for the relevant product */}
            <p>{cartMessages[product.productId]}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
