
import React, { useEffect, useState, useRef } from "react";
import { Route, Routes, Link, useNavigate, useLocation } from "react-router-dom";
import { Home as HomeIcon, Store, ShoppingCart, Receipt, LogOut, Settings, ChevronDown, Menu, X, User } from 'lucide-react';
import Home from "./Home";
import Products from "./Products";
import ViewProduct from "./ViewProduct";
import Cart from "./Cart";
import Buy from "./Buy";
import MyOrders from "./MyOrders";
import PrivacyPolicy from "../common/PrivacyPolicy";
import TermsOfService from "../common/TermsOfService";
import SearchBar from "./SearchBar";
import Account from "./Account";
import "./UserNavbar.css";

export default function UserNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isUserLoggedIn");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/products', icon: Store, label: 'Products' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart' },
    { path: '/orders', icon: Receipt, label: 'Orders' }
  ];

  const profileItems = [
    { 
      label: 'Account Settings', 
      icon: Settings, 
      action: () => { navigate("/account"); setIsProfileOpen(false); }
    },
    { 
      label: 'Your Orders', 
      icon: Receipt, 
      action: () => { navigate("/orders"); setIsProfileOpen(false); }
    },
    { 
      label: 'Logout', 
      icon: LogOut, 
      action: handleLogout 
    }
  ];

  const renderProfile = () => {
    if (user?.image) {
      return (
        <img
          src={user.image}
          alt="Profile"
          className="profile-image"
        />
      );
    }
    const initial = user?.username?.charAt(0).toUpperCase() || "U";
    return (
      <div className="profile-initial">
        {initial}
      </div>
    );
  };

  return (
    <div>
      <nav className="user-navbar">
        <div className="nav-container">
          {/* Brand */}
          <div className="nav-brand">
            <Link to="/" className="brand-link">
              <Store className="brand-icon" />
              <span className="brand-text">Fourz Deals</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-desktop">
            <div className="nav-links">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`nav-link ${activeTab === path ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{label}</span>
                </Link>
              ))}
            </div>
            
            <div className="nav-search">
              <SearchBar />
            </div>
            
            <div className="profile-dropdown" ref={profileRef}>
              <button
                className="profile-trigger"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                {renderProfile()}
                <ChevronDown className={`profile-chevron ${isProfileOpen ? 'rotated' : ''}`} />
              </button>
              
              <div className={`dropdown-menu ${isProfileOpen ? 'active' : ''}`}>
                <div className="dropdown-header">
                  <div className="user-info">
                    <div className="user-name">{user?.username || 'User'}</div>
                    <div className="user-email">{user?.email || 'user@example.com'}</div>
                  </div>
                </div>
                <div className="dropdown-items">
                  {profileItems.map(({ label, icon: Icon, action }, index) => (
                    <button
                      key={index}
                      className={`dropdown-item ${label === 'Logout' ? 'danger' : ''}`}
                      onClick={action}
                    >
                      <Icon className="dropdown-icon" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Overlay */}
        <div className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu">
            {/* Mobile Profile Section */}
            <div className="mobile-profile-section">
              <div className="mobile-profile-info">
                {renderProfile()}
                <div className="mobile-user-details">
                  <div className="mobile-user-name">{user?.username || 'User'}</div>
                  <div className="mobile-user-email">{user?.email || 'user@example.com'}</div>
                </div>
              </div>
            </div>

            {/* Mobile Search */}
            <div className="mobile-search-section">
              <SearchBar />
            </div>

            {/* Mobile Navigation Links */}
            <div className="mobile-nav-links">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`mobile-nav-link ${activeTab === path ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="mobile-nav-icon" />
                  <span className="mobile-nav-label">{label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Profile Actions */}
            <div className="mobile-profile-actions">
              <div className="mobile-section-title">Account</div>
              {profileItems.map(({ label, icon: Icon, action }, index) => (
                <button
                  key={index}
                  className={`mobile-profile-action ${label === 'Logout' ? 'danger' : ''}`}
                  onClick={() => {
                    action();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Icon className="mobile-action-icon" />
                  <span className="mobile-action-label">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/viewproduct/:productId" element={<ViewProduct />} />
        <Route path="/buy" element={<Buy />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </div>
  );
}
