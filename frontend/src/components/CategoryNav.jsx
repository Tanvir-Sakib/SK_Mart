import { useState, useEffect } from "react";
import { apiClient, endpoints } from "../utils/api";

const CategoryNav = ({ onCategorySelect, selectedCategory, onSearch, onFilterReset, searchTerm: externalSearchTerm }) => {
  const [categories, setCategories] = useState([]);
  const [localSearchTerm, setLocalSearchTerm] = useState(externalSearchTerm || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Update local search term when external changes
  useEffect(() => {
    if (externalSearchTerm !== undefined && externalSearchTerm !== localSearchTerm) {
      setLocalSearchTerm(externalSearchTerm);
    }
  }, [externalSearchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.categories.getAll);
      console.log("Categories response:", response.data);
      
      let categoriesData = [];
      if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories;
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    onCategorySelect(categoryId);
  };

  const handleHomeClick = () => {
    onFilterReset();
    setLocalSearchTerm("");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
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
        <button 
          className={`category-btn home-btn ${!selectedCategory ? "active" : ""}`}
          onClick={handleHomeClick}
        >
          🏠 Home
        </button>

        <div className="search-container">
          <input
            type="text"
            className="search-input-nav"
            placeholder="🔍 Search products..."
            value={localSearchTerm}
            onChange={handleSearchChange}
            autoComplete="off"
          />
        </div>

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
      </div>
    </div>
  );
};

export default CategoryNav;