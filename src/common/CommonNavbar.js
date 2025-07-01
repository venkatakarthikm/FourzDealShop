
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { User, Home as HomeIcon, Store, Search } from 'lucide-react';
import Login from '../user/Login';
import Registration from '../user/Registration';
import ViewProduct from '../user/ViewProduct';
import Home from '../user/Home';
import Products from '../user/Products';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import SearchBar from '../user/SearchBar';
import './CommonNavbar.css';

export default function CommonNavbar({ onUserLogin }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  const navItems = [
  { path: '/', icon: HomeIcon, label: 'Home' },
  { path: '/products', icon: Store, label: 'Products' },
  { path: '/login', icon: User, label: 'Login' }
];

  return (
    <div>
      <nav className="common-navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <Link to="/" className="brand-link">
              <Store className="brand-icon" />
              <span className="brand-text">Shop</span>
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
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-search">
            <SearchBar />
          </div>
          <div className="mobile-links">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`mobile-link ${activeTab === path ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="mobile-icon" />
                <span className="mobile-label">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<Login onUserLogin={onUserLogin} />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/viewproduct/:productId" element={<ViewProduct />} />
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>
    </div>
  );
}
