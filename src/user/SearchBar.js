import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Search, Clock, X } from "lucide-react";
import "./SearchBar.css";
import config from "../config";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecents, setShowRecents] = useState(false);
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const debounceRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const isUserLoggedIn = localStorage.getItem("isUserLoggedIn");

  const saveSearchQuery = async (searchText) => {
    if (!searchText.trim()) return;
    if (isUserLoggedIn && user?.userid) {
      try {
        await axios.post(`${config.url}/users/${user.userid}/search-history`, {
          query: searchText.trim(),
        });
      } catch (error) {
        console.error("Error saving search:", error);
      }
    } else {
      let localHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      localHistory = localHistory.filter((s) => s !== searchText);
      localHistory.unshift(searchText);
      if (localHistory.length > 10) localHistory = localHistory.slice(0, 10);
      localStorage.setItem("searchHistory", JSON.stringify(localHistory));
    }
    loadRecentSearches();
  };

  const loadRecentSearches = async () => {
    if (isUserLoggedIn && user?.userid) {
      try {
        const res = await axios.get(`${config.url}/users/${user.userid}/search-history`);
        setRecentSearches(res.data || []);
      } catch (error) {
        console.error("Error loading search history:", error);
        setRecentSearches([]);
      }
    } else {
      const localHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      setRecentSearches(localHistory);
    }
  };

  const clearRecentSearches = () => {
    if (isUserLoggedIn && user?.userid) {
      // Could add API call to clear server-side history
    } else {
      localStorage.removeItem("searchHistory");
    }
    setRecentSearches([]);
    setShowRecents(false);
  };

  useEffect(() => {
    loadRecentSearches();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setShowRecents(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      if (query.trim()) {
        setIsLoading(true);
        axios
          .get(`${config.url}/products/search?query=${encodeURIComponent(query)}`)
          .then((res) => {
            setResults(res.data);
            setShowDropdown(true);
            setShowRecents(false);
            setIsLoading(false);
          })
          .catch(() => {
            setResults([]);
            setIsLoading(false);
          });
      } else {
        setResults([]);
        setShowDropdown(false);
        setIsLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleEnter = (e) => {
    if (e.key === "Enter" && query.trim()) {
      handleSearch(query);
    }
  };

  const handleSearch = (searchQuery) => {
    saveSearchQuery(searchQuery);
    navigate(`/products?query=${encodeURIComponent(searchQuery)}`);
    setShowDropdown(false);
    setShowRecents(false);
    setQuery("");
  };

  const handleInputFocus = () => {
    if (!query && recentSearches.length > 0) {
      setShowRecents(true);
    } else if (query && results.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleRecentClick = (searchText) => {
    setQuery(searchText);
    handleSearch(searchText);
  };

  const clearQuery = () => {
    setQuery("");
    setShowDropdown(false);
    setResults([]);
  };

  return (
    <div className="search-bar-container" ref={searchContainerRef}>
      <div className="search-input-wrapper">
        {/* <Search className="search-icon" /> */}
        <input
          type="text"
          placeholder="🔍 Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleEnter}
          onFocus={handleInputFocus}
          className="search-input"
        />
        {query && (
          <button className="clear-btn" onClick={clearQuery}>
            <X className="clear-icon" />
          </button>
        )}
        {isLoading && <div className="search-loading" />}
      </div>
      {/* Search Results Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="search-dropdown">
          <div className="dropdown-header">
            <span>Products</span>
          </div>
          <div className="search-results">
            {results.slice(0, 6).map((item) => (
              <Link
                key={item.productId}
                to={`/viewproduct/${item.productId}`}
                className="search-result-item"
                onClick={() => saveSearchQuery(item.productName)}
              >
                <img
                  src={item.productImages[0]}
                  alt={item.productName}
                  className="result-image"
                />
                <div className="result-info">
                  <p className="result-name">{item.productName}</p>
                  <p className="result-price">
                    ${item.originalPrice - item.priceDiscount}
                  </p>
                </div>
              </Link>
            ))}
            {results.length > 6 && (
              <button
                className="view-all-btn"
                onClick={() => handleSearch(query)}
              >
                View all {results.length} results
              </button>
            )}
          </div>
        </div>
      )}
      {/* Recent Searches */}
      {showRecents && recentSearches.length > 0 && (
        <div className="search-dropdown recent-dropdown">
          <div className="dropdown-header">
            <span>Recent Searches</span>
            <button onClick={clearRecentSearches} className="clear-all-btn">
              Clear all
            </button>
          </div>
          <div className="recent-searches">
            {recentSearches.slice(0, 8).map((searchText, index) => (
              <button
                key={index}
                className="recent-search-item"
                onClick={() => handleRecentClick(searchText)}
              >
                <Clock className="recent-icon" />
                <span>{searchText}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* No Results */}
      {showDropdown && results.length === 0 && query && !isLoading && (
        <div className="search-dropdown">
          <div className="no-results">
            <p>No products found for "{query}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;