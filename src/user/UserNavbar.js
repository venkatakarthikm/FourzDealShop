import React, { useEffect, useState } from "react";
import {
  Route,
  Routes,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Home from "./Home";
import LogoutIcon from "@mui/icons-material/Logout";
import Tooltip from "@mui/material/Tooltip";
import HomeSharpIcon from "@mui/icons-material/HomeSharp";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Products from "./Products";
import ViewProduct from "./ViewProduct";
import Cart from "./Cart";
import Buy from "./Buy";
import MyOrders from "./MyOrders";
import AddProduct from "./AddProduct";
import PrivacyPolicy from "../common/PrivacyPolicy";
import TermsOfService from "../common/TermsOfService";

export default function UserNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);
  const handleLogout = () => {
    localStorage.removeItem("isUserLoggedIn");
    localStorage.removeItem("user");

    navigate("/login");
    window.location.reload();
  };

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
            <Link
              to="/cart"
              className={activeTab === "/cart" ? "active" : ""}
            >
              <ShoppingCartIcon style={{ fontSize: "30px" }} />{" "}
            </Link>
          </li>
          <Tooltip title="Logout">
            <div onClick={handleLogout} style={{ cursor: "pointer" }}>
              <LogoutIcon />
            </div>
          </Tooltip>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} exact />
        <Route path="/products" element={<Products />} exact />
        <Route path="/cart" element={<Cart />} exact />
        <Route path="/orders" element={<MyOrders />} exact/>
        <Route path="/viewproduct/:productId" element={<ViewProduct />}exact />
        <Route path="/buy" element={<Buy />} exact/>
        <Route path="/privacy" element={<PrivacyPolicy />} exact />
        <Route path="/terms" element={<TermsOfService />} exact />
        <Route path="/addproduct" element={<AddProduct />} exact/>
      </Routes>
    </div>
  );
}
