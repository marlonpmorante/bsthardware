// src/pages/ProductsPage.jsx
import React from 'react';
import { Search, X } from "lucide-react";

export const ProductsPage = ({
  searchTerm,
  setSearchTerm,
  searchInputRef,
  handleClearSearch,
  error,
  filteredData,
  imageMap,
}) => (
  <div className="materials-container">
    <h2>Available Hardware Materials</h2>
    <div className="search-container">
      <Search className="search-icon" size={16} />
      <input
        ref={searchInputRef}
        className="search-bar"
        type="text"
        placeholder="Search for materials..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
      />
      {searchTerm && (
        <button className="clear-button" onClick={handleClearSearch} aria-label="Clear search">
          <X size={16} />
        </button>
      )}
    </div>
    {error && <div className="error-message">{error}</div>}
    {filteredData.some((cat) => cat.items.length > 0) ? (
      filteredData.map(
        (category, idx) =>
          category.items.length > 0 && (
            <div key={idx} className="category-section">
              <h3>{category.category}</h3>
              <ul>
                {category.items.map((item, i) => (
                  <li key={i}>
                    <div className="product-image-container">
                      <img
                        src={item.image_url || imageMap[item.name] || "/placeholder.jpg"}
                        alt={item.name}
                        className="product-image"
                      />
                    </div>
                    <div className="product-info">
                      <h4 className="product-name">{item.name}</h4>
                      <p className="product-price">₱{item.price}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
      )
    ) : (
      <div className="no-items-message">No products found.</div>
    )}
  </div>
);