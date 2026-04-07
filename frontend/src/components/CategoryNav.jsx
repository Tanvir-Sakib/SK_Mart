import { useState, useEffect } from "react";
import axios from "axios";
import { apiClient, endpoints, getImageUrl } from "../utils/api";

const CategoryNav = ({ onCategorySelect, selectedCategory, onSearch, onFilterReset }) => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log("Fetching categories...");
      const response = await apiClient.get(endpoints.categories.getAll);
      console.log("Categories fetched:", response.data);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    console.log("Category clicked:", categoryId);
    onCategorySelect(categoryId);
  };

  const handleHomeClick = () => {
    console.log("Home clicked - resetting filters");
    onFilterReset();
    setSearchTerm("");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  if (loading) {
    return (
      <div className="category-nav">
        <div className="category-nav-container">
          <div className="loading-categories">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-nav">
      <div className="category-nav-container">
        {/* 1st: Home Button */}
        <button 
          className={`category-btn home-btn ${!selectedCategory ? "active" : ""}`}
          onClick={handleHomeClick}
        >
          🏠 Home
        </button>

        {/* 2nd: Categories */}
        <div className="categories-scroll">
          {categories.map((category) => (
            <button
              key={category._id}
              className={`category-btn ${selectedCategory === category._id ? "active" : ""}`}
              onClick={() => handleCategoryClick(category._id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* 3rd: Search Bar */}
        <div className="search-container">
          <input
            type="text"
            className="search-input-nav"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;