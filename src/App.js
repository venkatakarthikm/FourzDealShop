import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import UserNavbar from './user/UserNavbar';
import CommonNavbar from './common/CommonNavbar';
import './App.css';

export default function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const userLoggedIn = localStorage.getItem('isUserLoggedIn') === 'true';
    setIsUserLoggedIn(userLoggedIn);
  }, []);

  const onUserLogin = () => {
    localStorage.setItem('isUserLoggedIn', 'true');
    setIsUserLoggedIn(true);
  };

  return (
    <div className="app-container">
      <Router>
        {isUserLoggedIn ? (
          <UserNavbar />
        ) : (
          <CommonNavbar onUserLogin={onUserLogin} />
        )}
      </Router>
      
      {/* Content goes here */}
      <div className="content">
        {/* Render the content of the page */}
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 FourzCart. All rights reserved.</p>
          <p>
            <a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a> | <a href="/">Sell Products</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
