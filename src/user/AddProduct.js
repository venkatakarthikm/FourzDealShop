import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import config from "../config";
import "./AddProduct.css";

const AddProduct = () => {
  const [productName, setProductName] = useState("");
  const [productImages, setProductImages] = useState([]);
  const [category, setCategory] = useState("mobiles");
  const [saleType, setSaleType] = useState("Regular");
  const [customSaleName, setCustomSaleName] = useState("");
  const [discountValidUntil, setDiscountValidUntil] = useState(null);
  const [otherDetails, setOtherDetails] = useState({
    productId: "",
    originalPrice: "",
    priceDiscount: "0",
    productDescription: "",
    productTags: "",
  });
  const [isDragging, setIsDragging] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      ["image/jpeg", "image/png", "image/jpg"].includes(file.type)
    );
    setProductImages((prevImages) => [...prevImages, ...files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      ["image/jpeg", "image/png", "image/jpg"].includes(file.type)
    );
    setProductImages((prevImages) => [...prevImages, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (productImages.length === 0) {
      alert("Please select at least one image.");
      return;
    }

    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("productId", otherDetails.productId);
    formData.append("originalPrice", otherDetails.originalPrice);
    formData.append("priceDiscount", otherDetails.priceDiscount);
    formData.append("discountValidUntil", discountValidUntil);
    formData.append("productDescription", otherDetails.productDescription);
    formData.append("productTags", JSON.stringify(otherDetails.productTags.split(",")));
    formData.append("category", category);
    formData.append("saleType", saleType === "Other" ? customSaleName : saleType);

    for (let i = 0; i < productImages.length; i++) {
      formData.append("productImages", productImages[i]);
    }

    try {
      const response = await axios.post(`${config.url}/addproduct`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Product added successfully!");
      setProductName("");
      setProductImages([]);
      setCategory("mobiles");
      setSaleType("Regular");
      setCustomSaleName("");
      setDiscountValidUntil(null);
      setOtherDetails({
        productId: "",
        originalPrice: "",
        priceDiscount: "0",
        productDescription: "",
        productTags: "",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="floating-form">
      <div className="floating-label">
        <input
          type="text"
          value={otherDetails.productId}
          onChange={(e) =>
            setOtherDetails({ ...otherDetails, productId: e.target.value })
          }
          required
        />
        <label>Product ID</label>
      </div>
      <div className="floating-label">
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
        <label>Product Name</label>
      </div>
      <div className="floating-label">
        <input
          type="number"
          value={otherDetails.originalPrice}
          onChange={(e) =>
            setOtherDetails({ ...otherDetails, originalPrice: e.target.value })
          }
          required
        />
        <label>Original Price</label>
      </div>
      <select value={saleType} onChange={(e) => setSaleType(e.target.value)} required>
        <option value="Regular">Regular</option>
        <option value="Special">Special Sale</option>
        <option value="Limited">Limited Edition</option>
        <option value="Other">Other</option>
      </select>
      {saleType === "Other" && (
        <div className="floating-label">
          <input
            type="text"
            value={customSaleName}
            onChange={(e) => setCustomSaleName(e.target.value)}
            required
          />
          <label>Custom Sale Name</label>
        </div>
      )}
      {saleType !== "Regular" && (
        <>
          <div className="floating-label">
            <input
              type="number"
              value={otherDetails.priceDiscount}
              onChange={(e) =>
                setOtherDetails({ ...otherDetails, priceDiscount: e.target.value })
              }
              required
            />
            <label>Price Discount</label>
          </div>
          <div className="date-time-picker">
            <DatePicker
              selected={discountValidUntil}
              onChange={(date) => setDiscountValidUntil(date)}
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select date and time"
              className="date-picker"
            />
          </div>
        </>
      )}
      <div className="floating-label">
        <textarea
          value={otherDetails.productDescription}
          onChange={(e) =>
            setOtherDetails({ ...otherDetails, productDescription: e.target.value })
          }
          required
        />
        <label>Product Description</label>
      </div>
      <div className="floating-label">
        <input
          type="text"
          value={otherDetails.productTags}
          onChange={(e) =>
            setOtherDetails({ ...otherDetails, productTags: e.target.value })
          }
          required
        />
        <label>Product Tags (comma-separated)</label>
      </div>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="mobiles">Mobiles</option>
        <option value="laptops">Laptops</option>
        <option value="smartwatch">Smartwatch</option>
        {/* Add more categories */}
      </select>
      <div
        className={`drop-zone ${isDragging ? "dragging" : ""}`}
        onClick={() => document.getElementById("imageInput").click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <p>Drag and drop images here, or click to select</p>
        <input
          type="file"
          multiple
          id="imageInput"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
      </div>
      {productImages.length > 0 && (
        <div className="image-preview">
          {Array.from(productImages).map((image, index) => (
            <div key={index} className="preview-item">
              <img src={URL.createObjectURL(image)} alt="Preview" />
              <p>{image.name}</p>
            </div>
          ))}
        </div>
      )}
      <button type="submit">Add Product</button>
    </form>
  );
};

export default AddProduct;
