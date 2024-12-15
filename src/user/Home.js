import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";
import config from "../config";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [imageIndexes, setImageIndexes] = useState({});
  const [timeLeft, setTimeLeft] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [topProductIndex, setTopProductIndex] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${config.url}/saleproducts`);
        setProducts(response.data);

        // Initialize each product's current image index to 0
        const initialIndexes = response.data.reduce((acc, product) => {
          acc[product.productId] = 0;
          return acc;
        }, {});
        setImageIndexes(initialIndexes);

        // Initialize countdown timers for each product
        const initialTimeLeft = response.data.reduce((acc, product) => {
          const discountEndDate = new Date(product.discountValidUntil);
          const now = new Date();
          acc[product.productId] = Math.max(discountEndDate - now, 0);
          return acc;
        }, {});
        setTimeLeft(initialTimeLeft);

        // Set top products based on discount
        const sortedProducts = response.data
          .filter(product => product.priceDiscount > 0) // Only products with discount
          .sort((a, b) => b.priceDiscount - a.priceDiscount) // Sort by discount
          .slice(0, 5); // Get top 5
        setTopProducts(sortedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) =>
        Object.keys(prevTimeLeft).reduce((acc, productId) => {
          acc[productId] = Math.max(prevTimeLeft[productId] - 1000, 0);
          return acc;
        }, {})
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Automatically change the top product index
  useEffect(() => {
    const interval = setInterval(() => {
      setTopProductIndex((prevIndex) => (prevIndex + 1) % topProducts.length);
    }, 4000); // Change every 4 seconds
    setIntervalId(interval);
    return () => clearInterval(interval);
  }, [topProducts.length]);

  // Handle next image for the slider
  const nextImage = (productId, imagesLength) => {
    setImageIndexes((prevIndexes) => ({
      ...prevIndexes,
      [productId]: (prevIndexes[productId] + 1) % imagesLength,
    }));
  };

  // Convert milliseconds to time components (days, hours, minutes, seconds)
  const formatTimeLeft = (time) => {
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Handle "View Product" button click
  const handleViewProduct = (productId) => {
    window.location.href = `/viewproduct/${productId}`; // Navigate to the product page
  };

  return (
    <div className="home-container">
      {/* Top Products Section */}
      {topProducts.length > 0 && (
        <>
          <h2 className="section-heading">Top 5 Products</h2>
          <div className="top-product-card">
            <div className="top-product-details">
              <h2 className="top-product-name">{topProducts[topProductIndex].productName}</h2>
              <div className="top-pricing">
                <p className="top-original-price">
                  ${topProducts[topProductIndex].originalPrice.toFixed(2)}
                </p>
                <p className="top-discounted-price">
                  ${ (topProducts[topProductIndex].originalPrice - topProducts[topProductIndex].priceDiscount).toFixed(2) }
                </p>
                <p className="top-savings">
                  You save ${topProducts[topProductIndex].priceDiscount.toFixed(2)}
                </p>
              </div>
              <div className="top-product-dots">
                {topProducts.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${topProductIndex === index ? 'active' : ''}`}
                    onClick={() => setTopProductIndex(index)}
                  ></span>
                ))}
              </div>

              {/* View Product Button for Top Products */}
              <button
                className="view-product-button"
                onClick={() => handleViewProduct(topProducts[topProductIndex].productId)}
              >
                View Product
              </button>
            </div>
            <div className="top-product-image">
              <img
                src={`${config.url}${topProducts[topProductIndex].productImages[0]}`}
                alt={topProducts[topProductIndex].productName}
                className="top-product-image-element fade-in"
              />
            </div>
          </div>
        </>
      )}

      {/* Sale Products Section */}
      <h2 className="section-heading">Sale Products</h2>
      {products.map((product) => {
        const timeRemaining = timeLeft[product.productId];

        return (
          <div className="product-display" key={product.productId}>
            {/* Left Section: Product Details */}
            <div className="product-details">
              <h2 className="product-name">{product.productName}</h2>
              {/* Display prices with discount */}
              <div className="pricing">
                <p className="original-price">
                  ${product.originalPrice.toFixed(2)}
                </p>
                <p className="discounted-price">
                  ${ (product.originalPrice - product.priceDiscount).toFixed(2) }
                </p>
                <p className="savings">
                  You save ${product.priceDiscount.toFixed(2)}
                </p>
              </div>

              {/* Countdown timer */}
              {timeRemaining > 0 && (
                <p className="countdown">
                  Sale ends in: {formatTimeLeft(timeRemaining)}
                </p>
              )}

              {/* View Product Button */}
              <button
                className="view-product-button"
                onClick={() => handleViewProduct(product.productId)}
              >
                View Product
              </button>
            </div>

            {/* Right Section: Image Slider */}
            <div className="product-slider">
              <button
                className="arrow right-arrow"
                onClick={() => nextImage(product.productId, product.productImages.length)}
              >
                &#8250;
              </button>

              {/* Image count on top-right */}
              <div className="image-count">
                {imageIndexes[product.productId] + 1}/{product.productImages.length}
              </div>

              <img
                src={`${config.url}${product.productImages[imageIndexes[product.productId]]}`}
                alt={product.productName}
                className="product-image fade-in"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Home;
