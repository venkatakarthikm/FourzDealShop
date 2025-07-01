
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Clock, ShoppingCart, Eye } from 'lucide-react';
import "./Home.css";
import config from "../config";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [imageIndexes, setImageIndexes] = useState({});
  const [timeLeft, setTimeLeft] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [topProductIndex, setTopProductIndex] = useState(0);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [homeLoading, setHomeLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setHomeLoading(true);
        const response = await axios.get(`${config.url}/saleproducts`);
        setProducts(response.data);
        
        const indexes = {};
        const times = {};
        response.data.forEach((product) => {
          indexes[product.productId] = 0;
          times[product.productId] = Math.max(new Date(product.discountValidUntil) - new Date(), 0);
        });
        setImageIndexes(indexes);
        setTimeLeft(times);
        
        const sorted = response.data
          .filter((p) => p.priceDiscount > 0)
          .sort((a, b) => b.priceDiscount - a.priceDiscount)
          .slice(0, 5);
        setTopProducts(sorted);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setHomeLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) =>
        Object.keys(prev).reduce((acc, id) => {
          acc[id] = Math.max(prev[id] - 1000, 0);
          return acc;
        }, {})
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!topProducts.length) return;
    const interval = setInterval(() => {
      setTopProductIndex((prev) => (prev + 1) % topProducts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [topProducts.length]);

  useEffect(() => {
    const fetchRecentAndRecommended = async () => {
      if (!user?.username) return;
      try {
        const response = await axios.get(`${config.url}/products/recent-recommended/${user.username}`);
        setRecentProducts(response.data.recent);
        setRecommendedProducts(response.data.recommended);
      } catch (error) {
        console.error("Error loading recent/recommended:", error);
      }
    };
    fetchRecentAndRecommended();
  }, [user]);

  const nextImage = (productId, total) => {
    setImageIndexes((prev) => ({
      ...prev,
      [productId]: (prev[productId] + 1) % total,
    }));
  };

  const formatTimeLeft = (time) => {
    const d = Math.floor(time / (1000 * 60 * 60 * 24));
    const h = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((time % (1000 * 60)) / 1000);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const handleViewProduct = (productId) => {
    window.location.href = `/viewproduct/${productId}`;
  };

  const addToCart = async (productId) => {
    if (!user) return;
    
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    try {
      await axios.post(`${config.url}/cart/add`, {
        userId: user.userid,
        productId,
        quantity: 1,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const HomeLoadingSkeleton = () => (
    <div className="home-loading-container">
      <div className="home-skeleton-hero"></div>
      <div className="home-skeleton-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="home-skeleton-card"></div>
        ))}
      </div>
    </div>
  );

  if (homeLoading) return <HomeLoadingSkeleton />;

  const renderHomeProductCard = (product) => {
    const timeRemaining = timeLeft[product.productId];
    const discountedPrice = product.originalPrice - product.priceDiscount;
    
    return (
      <div className="home-product-card home-animate-slide-up" key={product.productId}>
        <div className="home-product-image-container">
          <img
            src={product.productImages[imageIndexes[product.productId]]}
            alt={product.productName}
            className="home-product-image"
          />
          <button
            className="home-image-nav-btn home-next-btn"
            onClick={() => nextImage(product.productId, product.productImages.length)}
          >
            <ChevronRight className="home-icon" />
          </button>
          <div className="home-image-indicators">
            {product.productImages.map((_, index) => (
              <div
                key={index}
                className={`home-indicator ${index === imageIndexes[product.productId] ? 'home-active' : ''}`}
              />
            ))}
          </div>
          <div className="home-sale-badge">
            {Math.round((product.priceDiscount / product.originalPrice) * 100)}% OFF
          </div>
        </div>

        <div className="home-product-content">
          <h3 className="home-product-title">{product.productName}</h3>
          <div className="home-product-seller">by {product.productOwner}</div>
          
          <div className="home-product-pricing">
            <div className="home-price-main">${discountedPrice.toFixed(2)}</div>
            <div className="home-price-original">${product.originalPrice.toFixed(2)}</div>
            <div className="home-price-savings">Save ${product.priceDiscount.toFixed(2)}</div>
          </div>

          <div className="home-product-stock">
            <div className="home-stock-indicator">
              <div className="home-stock-bar">
                <div 
                  className="home-stock-fill" 
                  style={{width: `${Math.min((product.stock / 100) * 100, 100)}%`}}
                ></div>
              </div>
              <span className="home-stock-text">{product.stock} left</span>
            </div>
          </div>

          {timeRemaining > 0 && (
            <div className="home-countdown-timer">
              <Clock className="home-timer-icon" />
              <span className="home-timer-text">{formatTimeLeft(timeRemaining)}</span>
            </div>
          )}

          <div className="home-product-actions">
            <button
              className="home-btn home-btn-primary"
              onClick={() => handleViewProduct(product.productId)}
            >
              <Eye className="home-btn-icon" />
              View Details
            </button>
            {user && (
              <button
                className={`home-btn home-btn-secondary ${addingToCart[product.productId] ? 'home-loading' : ''}`}
                onClick={() => addToCart(product.productId)}
                disabled={addingToCart[product.productId]}
              >
                <ShoppingCart className="home-btn-icon" />
                {addingToCart[product.productId] ? 'Adding...' : 'Add to Cart'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHomeGridSection = (title, products) => (
    <section className="home-grid-section home-animate-fade-in">
      <h2 className="home-section-title">{title}</h2>
      <div className="home-product-grid">
        {products.map((product) => (
          <div 
            key={product.productId} 
            className="home-grid-card home-animate-scale-in"
            onClick={() => handleViewProduct(product.productId)}
          >
            <div className="home-grid-image-container">
              <img 
                src={product.productImages?.[0]} 
                alt={product.productName} 
                className="home-grid-image" 
              />
              {product.saleType !== "Regular" && (
                <div className="home-grid-badge">{product.saleType}</div>
              )}
            </div>
            <div className="home-grid-content">
              <h3 className="home-grid-title">{product.productName}</h3>
              <div className="home-grid-seller">by {product.productOwner}</div>
              <div className="home-grid-stock">{product.stock} in stock</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="home-container">
      {/* Hero Section */}
      {topProducts.length > 0 && (
        <section className="home-hero-section home-animate-fade-in">
          <div className="home-hero-content">
            <div className="home-hero-text">
              <div className="home-hero-badge">Featured Deal</div>
              <h1 className="home-hero-title">{topProducts[topProductIndex].productName}</h1>
              <div className="home-hero-pricing">
                <span className="home-hero-price">
                  ${(topProducts[topProductIndex].originalPrice - topProducts[topProductIndex].priceDiscount).toFixed(2)}
                </span>
                <span className="home-hero-original-price">
                  ${topProducts[topProductIndex].originalPrice.toFixed(2)}
                </span>
              </div>
              <div className="home-hero-savings">
                Save ${topProducts[topProductIndex].priceDiscount.toFixed(2)}
              </div>
              <button
                className="home-hero-btn"
                onClick={() => handleViewProduct(topProducts[topProductIndex].productId)}
              >
                Shop Now
              </button>
            </div>
            <div className="home-hero-image">
              <img
                src={topProducts[topProductIndex].productImages[0]}
                alt={topProducts[topProductIndex].productName}
                className="home-hero-product-image"
              />
            </div>
          </div>
          <div className="home-hero-indicators">
            {topProducts.map((_, index) => (
              <button
                key={index}
                className={`home-hero-indicator ${topProductIndex === index ? 'home-active' : ''}`}
                onClick={() => setTopProductIndex(index)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Sale Products */}
      <section className="home-sale-section">
        <h2 className="home-section-title">Flash Sales</h2>
        <div className="home-products-container">
          {products.map(renderHomeProductCard)}
        </div>
      </section>

      {/* User-specific sections */}
      {user && recentProducts.length > 0 && renderHomeGridSection("Continue Shopping", recentProducts)}
      {user && recommendedProducts.length > 0 && renderHomeGridSection("Recommended for You", recommendedProducts)}
      {!user && renderHomeGridSection("Popular Products", products.slice(0, 6))}
    </div>
  );
};

export default Home;
