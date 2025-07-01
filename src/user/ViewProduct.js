import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewProduct.css";
import config from "../config";

const ViewProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIndex, setModalIndex] = useState(null);
  const [modalImages, setModalImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewMsg, setReviewMsg] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [editingReview, setEditingReview] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editImages, setEditImages] = useState([]);
  const [imagesToKeep, setImagesToKeep] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showOptionsId, setShowOptionsId] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
const [recentViewedProducts, setRecentViewedProducts] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userid;
  const isLoggedIn = localStorage.getItem("isUserLoggedIn") === "true";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([
          axios.get(`${config.url}/product/${productId}`),
          axios.get(`${config.url}/reviews/${productId}`),
        ]);
        setProduct(prodRes.data);
        const all = revRes.data;
        const userOwn = all.find((r) => r.userId === userId);
        const others = all.filter((r) => r.userId !== userId);
        setUserReview(userOwn || null);
        setReviews(others);
      } catch {
        setError("Failed to load product or reviews.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
    const recent = JSON.parse(localStorage.getItem("recentProducts")) || [];
    const updated = [productId, ...recent.filter(id => id !== productId)].slice(0, 10);
    localStorage.setItem("recentProducts", JSON.stringify(updated));

    if (isLoggedIn && userId) {
      axios.post(`${config.url}/recent`, { userId, productId }).catch(() => {});
    }
  }

    const checkPurchaseStatus = async () => {
      if (isLoggedIn && userId) {
        try {
          const res = await axios.get(`${config.url}/orders/${userId}`);
          const bought = res.data.some((o) =>
            o.products.some((p) => p.productId === productId)
          );
          setCanReview(bought);
        } catch {
          setCanReview(false);
        }
      }
    };

    fetchData();
    checkPurchaseStatus();
  }, [productId, isLoggedIn, userId]);

  const handleThumbnailClick = (i) => {
    setSelectedImageIndex(i);
    setImageLoaded(false);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setReviewImages((prev) => [...prev, ...files]);
  };

  const addToCart = async () => {
    if (!userId) return setCartMessage("Please log in to add to cart.");
    setIsAddingToCart(true);
    try {
      await axios.post(`${config.url}/cart/add`, {
        userId,
        productId,
        quantity,
      });
      setCartMessage("Added to cart!");
      setTimeout(() => setCartMessage(""), 3000);
    } catch {
      setCartMessage("Failed to add to cart.");
      setTimeout(() => setCartMessage(""), 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const submitReview = async () => {
    if (!reviewText.trim()) return setReviewMsg("Please write review text.");
    setIsSubmittingReview(true);
    const form = new FormData();
    form.append("username", user.username);
    form.append("email", user.email);
    form.append("productid", productId);
    form.append("description", reviewText);
    form.append("userId", userId);
    reviewImages.forEach((img) => form.append("images", img));

    try {
      await axios.post(`${config.url}/insertreview`, form);
      const { data } = await axios.get(`${config.url}/reviews/${productId}`);
      const userOwn = data.find((r) => r.userId === userId);
      const others = data.filter((r) => r.userId !== userId);
      setUserReview(userOwn || null);
      setReviews(others);
      setReviewText("");
      setReviewImages([]);
      setReviewMsg("Review submitted successfully!");
      setTimeout(() => setReviewMsg(""), 3000);
    } catch (e) {
      setReviewMsg(e.response?.data?.message || "Submission failed.");
      setTimeout(() => setReviewMsg(""), 3000);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const deleteReview = async (reviewid) => {
    try {
      await axios.post(`${config.url}/deletereview`, { reviewid, userId });
      setUserReview(null);
    } catch {
      alert("Failed to delete review");
    }
  };

  const openFullscreenGallery = (startIndex) => {
    const all = reviews.concat(userReview ? [userReview] : []);
    const imgs = all.flatMap((r) => r.images || []);
    setModalImages(imgs);
    setModalIndex(startIndex);
  };

  const startEdit = (review) => {
    setEditingReview(review);
    setEditDescription(review.description);
    setImagesToKeep([...review.images]);
    setEditImages([]);
  };

  const removeImageFromKeep = (img) => {
    setImagesToKeep((prev) => prev.filter((url) => url !== img));
  };

  const handleEditImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setEditImages(files);
  };

  const submitEdit = async () => {
    if (!editDescription.trim()) return;
    setIsEditing(true);
    const form = new FormData();
    form.append("reviewid", editingReview.reviewid);
    form.append("userId", userId);
    form.append("description", editDescription);
    form.append("imagesToKeep", JSON.stringify(imagesToKeep));
    editImages.forEach((f) => form.append("images", f));

    try {
      await axios.post(`${config.url}/editreview`, form);
      const { data } = await axios.get(`${config.url}/reviews/${productId}`);
      const userOwn = data.find((r) => r.userId === userId);
      const others = data.filter((r) => r.userId !== userId);
      setUserReview(userOwn || null);
      setReviews(others);
      setEditingReview(null);
    } catch {
      alert("Update failed");
    } finally {
      setIsEditing(false);
    }
  };

  const allReviewImages = reviews
    .concat(userReview ? [userReview] : [])
    .flatMap((r) => r.images || []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error}</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  const discountedPrice = (
    product.originalPrice - product.priceDiscount
  ).toFixed(2);
  const discountPercentage = (
    (product.priceDiscount / product.originalPrice) *
    100
  ).toFixed(0);

  const handleBuyNow = () => {
      if (!product) return;

      const productData = {
        productId,
        quantity,
        image: product.productImages[0],
        seller: product.companyName || "Unknown Seller",
      };

      navigate("/buy", {
        state: {
          cartItems: [productData],
          productDetails: {
            [productId]: product,
          },
          directBuy: true,
        },
      });
    };

    if (isLoggedIn && user?.username) {
  axios.get(`${config.url}/products/recent-recommended/${user.username}`)
    .then(res => {
      setRecommendedProducts(res.data.recommended || []);
      setRecentViewedProducts(res.data.recent || []);
    })
    .catch(() => {});
}
const renderMiniProductCard = (p) => (
  <div className="mini-card" key={p.productId}>
    <img
      src={p.productImages[0]}
      alt={p.productName}
      className="mini-image"
      onClick={() => navigate(`/viewproduct/${p.productId}`)}
    />
    <div className="mini-info">
      <p className="mini-name">{p.productName}</p>
      <p className="mini-price">${p.originalPrice - p.priceDiscount}</p>
    </div>
  </div>
);


  return (
    <div className="view-product-container">
      <div className="product-content">
        <div className="product-images-section">
          <div className="main-image-container">
            <div className="image-wrapper">
              {!imageLoaded && <div className="image-skeleton"></div>}
              <img
                src={product.productImages[selectedImageIndex]}
                className={`main-product-image ${imageLoaded ? "loaded" : ""}`}
                alt={product.productName}
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          </div>
          <div className="thumbnails">
            {product.productImages.map((img, i) => (
              <div
                key={i}
                className={`thumbnail-wrapper ${
                  i === selectedImageIndex ? "active" : ""
                }`}
              >
                <img
                  src={img}
                  className="thumbnail-image"
                  onClick={() => handleThumbnailClick(i)}
                  alt={`${product.productName} view ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="product-details-section">
          <h1 className="product-title">{product.productName}</h1>

          <div className="product-details-inline">
    <p className="product-details-text">{product.productDetails}</p>
  </div>

          <div className="rating-section">
            <div className="rating-display">
              <span className="rating-stars">★★★★☆</span>
              <span className="rating-text">
                (4.2/5 - {reviews.length + (userReview ? 1 : 0)} reviews)
              </span>
            </div>
          </div>

          <div className="price-section">
            {product.priceDiscount > 0 ? (
              <div className="price-with-discount">
                <span className="current-price">${discountedPrice}</span>
                <span className="original-price">
                  ${product.originalPrice.toFixed(2)}
                </span>
                <span className="discount-badge">-{discountPercentage}%</span>
              </div>
            ) : (
              <span className="current-price">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            {product.priceDiscount > 0 && (
              <p className="savings-text">
                You save ${product.priceDiscount.toFixed(2)}
              </p>
            )}
          </div>
          <label>Stock: {product.stock}</label>

          <div className="purchase-section">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  className="quantity-btn decrease"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-display">{quantity}</span>
                <button
                  className="quantity-btn increase"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="btn btn-primary buy-now-btn"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
              <button
                className="btn btn-secondary add-to-cart-btn"
                onClick={addToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? (
                  <>
                    <div className="button-spinner"></div>
                    Adding...
                  </>
                ) : (
                  "Add to Cart"
                )}
              </button>
            </div>

            {cartMessage && (
              <div
                className={`message ${
                  cartMessage.includes("Failed") ? "error" : "success"
                }`}
              >
                {cartMessage}
              </div>
            )}
          </div>
          <div className="description-section">
            <h3>Description</h3>
            <p className="product-description">{product.productDescription}</p>
          </div>

          {/* Mobile-only description section */}
          <div className="mobile-description-section">
            <h3>Description</h3>
            <p className="product-description">{product.productDescription}</p>
          </div>
        </div>
      </div>

      {recommendedProducts.length > 0 && (
  <div className="recommended-section">
    <h2>Recommended for You</h2>
    <div className="mini-grid">
      {recommendedProducts.map(renderMiniProductCard)}
    </div>
  </div>
)}


      <div className="reviews-section">
        <h2 className="section-title">Customer Reviews</h2>

        {allReviewImages.length > 0 && (
          <div className="review-gallery">
            <h3>Photo Reviews</h3>
            <div className="gallery-scroll">
              {allReviewImages.map((img, i) => (
                <div
                  key={i}
                  className="gallery-item"
                  onClick={() => openFullscreenGallery(i)}
                >
                  <img
                    src={img}
                    className="gallery-thumb"
                    alt="Customer review"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {modalIndex !== null && (
          <div className="fullscreen-modal" onClick={() => setModalIndex(null)}>
            <button
              className="modal-nav left"
              onClick={(e) => {
                e.stopPropagation();
                setModalIndex(
                  (modalIndex - 1 + modalImages.length) % modalImages.length
                );
              }}
            >
              ‹
            </button>
            <img
              src={modalImages[modalIndex]}
              className="fullscreen-image"
              alt="Review"
            />
            <button
              className="modal-nav right"
              onClick={(e) => {
                e.stopPropagation();
                setModalIndex((modalIndex + 1) % modalImages.length);
              }}
            >
              ›
            </button>
            <button className="modal-close" onClick={() => setModalIndex(null)}>
              ×
            </button>
          </div>
        )}

        <div className="reviews-list">
          {userReview && (
            <div className="review-card user-review">
              <div className="review-header">
                <div className="user-info">
                  <img
                    src="/image.png"
                    className="user-avatar"
                    alt={userReview.username}
                  />
                  <div className="user-details">
                    <span className="username">{userReview.username}</span>
                    <span className="review-badge">Your Review</span>
                  </div>
                </div>
                <div className="review-actions">
                  <button
                    className="options-btn"
                    onClick={() =>
                      setShowOptionsId((p) =>
                        p === userReview.reviewid ? null : userReview.reviewid
                      )
                    }
                  >
                    ⋮
                  </button>
                  {showOptionsId === userReview.reviewid && (
                    <div className="options-dropdown">
                      <button onClick={() => startEdit(userReview)}>
                        Edit
                      </button>
                      <button onClick={() => deleteReview(userReview.reviewid)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="review-text">{userReview.description}</p>
              {userReview.images && userReview.images.length > 0 && (
                <div className="review-images">
                  {userReview.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className="review-image"
                      alt="Review"
                    />
                  ))}
                </div>
              )}
              <span className="review-date">
                {new Date(userReview.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}

          {reviews.map((r) => (
            <div key={r.reviewid} className="review-card">
              <div className="review-header">
                <div className="user-info">
                  <img
                    src="/image.png"
                    className="user-avatar"
                    alt={r.username}
                  />
                  <div className="user-details">
                    <span className="username">{r.username}</span>
                  </div>
                </div>
              </div>
              <p className="review-text">{r.description}</p>
              {r.images && r.images.length > 0 && (
                <div className="review-images">
                  {r.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className="review-image"
                      alt="Review"
                    />
                  ))}
                </div>
              )}
              <span className="review-date">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>

        {isLoggedIn && canReview && !userReview && (
          <div className="add-review-section">
            <h3>Write a Review</h3>
            <div className="review-form">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this product..."
                className="review-textarea"
              />
              <div className="file-input-wrapper">
                <input
                  type="file"
                  multiple
                  onChange={handleImageSelect}
                  accept="image/*"
                  id="review-images"
                  className="file-input"
                />
                <label htmlFor="review-images" className="file-input-label">
                  📷 Add Photos
                </label>
              </div>
              {reviewImages.length > 0 && (
                <p className="file-count">
                  {reviewImages.length} photo(s) selected
                </p>
              )}
              <button
                onClick={submitReview}
                disabled={isSubmittingReview || !reviewText.trim()}
                className="btn btn-primary submit-review-btn"
              >
                {isSubmittingReview ? (
                  <>
                    <div className="button-spinner"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
              {reviewMsg && (
                <div
                  className={`message ${
                    reviewMsg.includes("failed") || reviewMsg.includes("Failed")
                      ? "error"
                      : "success"
                  }`}
                >
                  {reviewMsg}
                </div>
              )}
            </div>
          </div>
        )}

        {editingReview && (
          <div className="edit-review-overlay">
            <div className="edit-review-modal">
              <h3>Edit Review</h3>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="review-textarea"
              />
              {imagesToKeep.length > 0 && (
                <div className="keep-images-section">
                  <p>Current Images:</p>
                  <div className="keep-images">
                    {imagesToKeep.map((img, i) => (
                      <div key={i} className="edit-image-item">
                        <img src={img} alt="Current" />
                        <button
                          onClick={() => removeImageFromKeep(img)}
                          className="remove-image-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="file-input-wrapper">
                <input
                  type="file"
                  multiple
                  onChange={handleEditImageSelect}
                  accept="image/*"
                  id="edit-review-images"
                  className="file-input"
                />
                <label
                  htmlFor="edit-review-images"
                  className="file-input-label"
                >
                  📷 Add New Photos
                </label>
              </div>
              <div className="edit-actions">
                <button
                  onClick={submitEdit}
                  disabled={isEditing}
                  className="btn btn-primary"
                >
                  {isEditing ? (
                    <>
                      <div className="button-spinner"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  onClick={() => setEditingReview(null)}
                  className="btn btn-secondary"
                  disabled={isEditing}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {recentViewedProducts.length > 0 && (
  <div className="recent-section">
    <h2>Recently Viewed</h2>
    <div className="mini-grid">
      {recentViewedProducts.map(renderMiniProductCard)}
    </div>
  </div>
)}

    </div>
  );
};

export default ViewProduct;
