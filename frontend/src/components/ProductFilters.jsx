import { useState, useEffect } from "react";
import axios from "axios";
import { apiClient, endpoints, getImageUrl } from "../utils/api";

const ProductFilters = ({ onFilterChange, onSortChange, onSearchChange }) => {
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    onFilterChange({ category: categoryId, priceRange });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const newPriceRange = { ...priceRange, [name]: value };
    setPriceRange(newPriceRange);
    onFilterChange({ category: selectedCategory, priceRange: newPriceRange });
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    onSortChange(value);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setSearchTerm("");
    onFilterChange({ category: "", priceRange: { min: "", max: "" } });
    onSearchChange("");
  };

  return (
    <div className="filters-container">
      <button 
        className="filter-toggle-btn"
        onClick={() => setShowFilters(!showFilters)}
      >
        {showFilters ? "Hide Filters ▲" : "Show Filters ▼"}
      </button>

      <div className={`filters-content ${showFilters ? "active" : ""}`}>
        {/* Search Bar */}
        <div className="filter-group">
          <label>🔍 Search Products</label>
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        {/* Sort Options */}
        <div className="filter-group">
          <label>📊 Sort By</label>
          <select value={sortBy} onChange={handleSortChange} className="sort-select">
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <label>📁 Category</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="filter-group">
          <label>💰 Price Range</label>
          <div className="price-range">
            <input
              type="number"
              name="min"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={handlePriceChange}
              className="price-input"
            />
            <span>-</span>
            <input
              type="number"
              name="max"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={handlePriceChange}
              className="price-input"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        <button onClick={clearFilters} className="clear-filters-btn">
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;