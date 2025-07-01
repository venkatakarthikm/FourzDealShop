
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, Filter, ArrowUpDown, Star } from 'lucide-react';
import "./Products.css";
import config from "../config";
import { useLocation } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [imageIndexes, setImageIndexes] = useState({});
  const [cartMessages, setCartMessages] = useState({});
  const [recentProductIds, setRecentProductIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");
  const [productsLoading, setProductsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query")?.toLowerCase() || "";

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user.userid : null;

  const categories = [
    { id: "mobiles", name: "Mobiles" },
    { id: "laptops", name: "Laptops" },
    { id: "smartwatch", name: "Smart Watch" },
    { id: "tablets", name: "Tablets" },
    { id: "accessories", name: "Accessories" },
    { id: "televisions", name: "TV & Audio" },
    { id: "cameras", name: "Cameras" },
    { id: "gaming", name: "Gaming" },
    { id: "home_appliances", name: "Home" },
    { id: "fitness", name: "Fitness" }
  ];

  useEffect(() => {
    const fetchRecentViewed = async () => {
      if (user?.username) {
        try {
          const res = await axios.get(`${config.url}/products/recent-recommended/${user.username}`);
          const ids = res.data.recent.map(p => p.productId);
          setRecentProductIds(ids);
        } catch (err) {
          console.error("Failed to load recent products:", err);
        }
      }
    };
    fetchRecentViewed();
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const res = await axios.get(`${config.url}/products`);
        const withImages = res.data.filter(
          (p) => Array.isArray(p.productImages) && p.productImages.length > 0
        );
        setProducts(withImages);

        const indexMap = withImages.reduce((acc, p) => {
          acc[p.productId] = 0;
          return acc;
        }, {});
        setImageIndexes(indexMap);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filteredProducts = products;

    if (searchQuery) {
      filteredProducts = filteredProducts.filter((product) =>
        product.productName?.toLowerCase().includes(searchQuery) ||
        product.productTags?.join(" ").toLowerCase().includes(searchQuery)
      );
    }

    if (selectedCategory !== "all") {
      filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
    }

    if (sortOrder === "high") {
      filteredProducts = [...filteredProducts].sort((a, b) =>
        (b.originalPrice - b.priceDiscount) - (a.originalPrice - a.priceDiscount)
      );
    } else if (sortOrder === "low") {
      filteredProducts = [...filteredProducts].sort((a, b) =>
        (a.originalPrice - a.priceDiscount) - (b.originalPrice - b.priceDiscount)
      );
    }

    setFiltered(filteredProducts);
  }, [products, searchQuery, selectedCategory, sortOrder]);

  const nextImage = (productId, total) => {
    setImageIndexes((prev) => ({
      ...prev,
      [productId]: (prev[productId] + 1) % total,
    }));
  };

  const prevImage = (productId, total) => {
    setImageIndexes((prev) => ({
      ...prev,
      [productId]: (prev[productId] - 1 + total) % total,
    }));
  };

  const addToCart = async (productId) => {
    if (!userId) {
      setCartMessages((prev) => ({
        ...prev,
        [productId]: "Please log in to add products to the cart.",
      }));
      setTimeout(() => {
        setCartMessages((prev) => ({ ...prev, [productId]: "" }));
      }, 3000);
      return;
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    try {
      await axios.post(`${config.url}/cart/add`, {
        userId,
        productId,
        quantity: 1,
      });
      setCartMessages((prev) => ({
        ...prev,
        [productId]: "Added to cart!",
      }));
    } catch {
      setCartMessages((prev) => ({
        ...prev,
        [productId]: "Failed to add to cart.",
      }));
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
      setTimeout(() => {
        setCartMessages((prev) => ({ ...prev, [productId]: "" }));
      }, 3000);
    }
  };

  const ProductsLoadingSkeleton = () => (
    <div className="products-loading-container">
      <div className="products-loading-header">
        <div className="products-skeleton-filter-bar"></div>
      </div>
      <div className="products-skeleton-list">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="products-skeleton-horizontal-card"></div>
        ))}
      </div>
    </div>
  );

  if (productsLoading) return <ProductsLoadingSkeleton />;

  const renderHorizontalCard = (p) => {
    const isRecent = recentProductIds.includes(p.productId);
    const showTag = p.saleType && p.saleType !== "Regular";
    const discountedPrice = p.originalPrice - (p.priceDiscount || 0);
    const discountPercentage = p.priceDiscount ? Math.round((p.priceDiscount / p.originalPrice) * 100) : 0;

    return (
      <div className="products-horizontal-card products-animate-scale-in" key={p.productId}>
        <div className="products-card-image-section">
          <div className="products-image-container">
            <img 
              src={p.productImages[imageIndexes[p.productId] || 0]} 
              alt={p.productName} 
              className="products-product-image" 
            />
            
            <div className="products-image-controls">
              <button 
                className="products-nav-btn products-prev-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage(p.productId, p.productImages.length);
                }}
              >
                <ChevronLeft className="products-nav-icon" />
              </button>
              <button 
                className="products-nav-btn products-next-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage(p.productId, p.productImages.length);
                }}
              >
                <ChevronRight className="products-nav-icon" />
              </button>
            </div>

            <div className="products-image-indicators">
              {p.productImages.map((_, index) => (
                <div
                  key={index}
                  className={`products-indicator ${index === (imageIndexes[p.productId] || 0) ? 'products-active' : ''}`}
                />
              ))}
            </div>

            <div className="products-badges">
              {showTag && (
                <div className={`products-sale-badge ${p.saleType === "Limited" ? "products-limited" : "products-flash"}`}>
                  {p.saleType}
                </div>
              )}
              {isRecent && <div className="products-recent-badge">Recently Viewed</div>}
              {discountPercentage > 0 && (
                <div className="products-discount-badge">{discountPercentage}% OFF</div>
              )}
            </div>
          </div>
        </div>

        <div className="products-card-content">
          <div className="products-card-main-content">
            <h3 className="products-product-name">{p.productName}</h3>
            <div className="products-product-description">
              {p.productDetails?.length > 150 ? 
                p.productDetails.slice(0, 150) + "..." : 
                p.productDetails
              }
            </div>

            <div className="products-product-meta">
              <div className="products-stock-info">
                <span className={`products-stock-status ${p.stock > 0 ? 'products-in-stock' : 'products-out-of-stock'}`}>
                  {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                </span>
              </div>
              <div className="products-seller-info">Sold by {p.companyName}</div>
            </div>
          </div>

          <div className="products-card-right-section">
            <div className="products-pricing-section">
              <div className="products-price-main">${discountedPrice.toLocaleString()}</div>
              {p.priceDiscount > 0 && (
                <>
                  <div className="products-price-original">${p.originalPrice.toLocaleString()}</div>
                  <div className="products-price-savings">Save ${p.priceDiscount.toLocaleString()}</div>
                </>
              )}
            </div>

            <div className="products-card-actions">
              <button
                className="products-btn products-btn-primary"
                onClick={() => window.location.href = `/viewproduct/${p.productId}`}
              >
                <Eye className="products-btn-icon" />
                View Details
              </button>
              <button
                className={`products-btn products-btn-secondary ${addingToCart[p.productId] ? 'products-loading' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(p.productId);
                }}
                disabled={addingToCart[p.productId] || p.stock === 0}
              >
                <ShoppingCart className="products-btn-icon" />
                {addingToCart[p.productId] ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>

            {cartMessages[p.productId] && (
              <div className={`products-cart-message ${cartMessages[p.productId].includes('success') || cartMessages[p.productId].includes('Added') ? 'products-success' : 'products-error'}`}>
                {cartMessages[p.productId]}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="products-container">
      {/* Header */}
      <div className="products-header">
        <div className="products-header-content">
          <h1 className="products-page-title">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
          </h1>
          <div className="products-results-count">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="products-filter-section">
        <div className="products-filter-container">
          <button 
            className="products-mobile-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="products-filter-icon" />
            Filters
          </button>

          <div className={`products-filter-content ${showFilters ? 'products-mobile-active' : ''}`}>
            <div className="products-category-filters">
              <button
                className={`products-filter-chip ${selectedCategory === 'all' ? 'products-active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`products-filter-chip ${selectedCategory === cat.id ? 'products-active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="products-sort-controls">
              <button
                className={`products-sort-btn ${sortOrder === "default" ? "products-active" : ""}`}
                onClick={() => setSortOrder("default")}
              >
                <ArrowUpDown className="products-sort-icon" />
                Default
              </button>
              <button
                className={`products-sort-btn ${sortOrder === "low" ? "products-active" : ""}`}
                onClick={() => setSortOrder("low")}
              >
                <ArrowUpDown className="products-sort-icon" />
                Price: Low to High
              </button>
              <button
                className={`products-sort-btn ${sortOrder === "high" ? "products-active" : ""}`}
                onClick={() => setSortOrder("high")}
              >
                <ArrowUpDown className="products-sort-icon" />
                Price: High to Low
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="products-list">
        {filtered.map(renderHorizontalCard)}
      </div>

      {filtered.length === 0 && !productsLoading && (
        <div className="products-empty-state">
          <div className="products-empty-icon">📦</div>
          <h3 className="products-empty-title">No products found</h3>
          <p className="products-empty-description">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </div>
  );
};

export default Products;
