import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from '../user/Login';
import Registration from '../user/Registration';
import ViewProduct from '../user/ViewProduct';
import PersonIcon from '@mui/icons-material/Person'; // Import the PersonIcon
import HomeSharpIcon from '@mui/icons-material/HomeSharp'; // Import the HomeSharpIcon
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import './CommonNavbar.css';
import Home from '../user/Home';
import Products from '../user/Products';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';

export default function CommonNavbar({ onUserLogin }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  return (
    <div>
      <nav>
        <ul>
        <li>
            <Link to="/" className={activeTab === "/" ? "active" : ""}>
              <HomeSharpIcon style={{ fontSize: "30px" }} />{" "}
              {/* Home icon with increased size */}
            </Link>
          </li>
          <li>
            <Link
              to="/products"
              className={activeTab === "/products" ? "active" : ""}
            >
              <StorefrontOutlinedIcon style={{ fontSize: "30px" }} />{" "}
            </Link>
          </li>
          <li>
            <Link to="/login" className={activeTab === '/login' ? 'active' : ''}>
              <PersonIcon style={{ fontSize: '30px', color: "red" }} /> {/* Login icon with increased size */}
            </Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/login" element={<Login onUserLogin={onUserLogin} />} exact />
        <Route path="/registration" element={<Registration />} exact />
        <Route path="/viewproduct/:productId" element={<ViewProduct />} />
        <Route path="/" element={<Home />} exact />
        <Route path="/products" element={<Products />} exact />
        <Route path="/privacy" element={<PrivacyPolicy />} exact />
        <Route path="/terms" element={<TermsOfService />} exact />
      </Routes>
    </div>
  );
}
