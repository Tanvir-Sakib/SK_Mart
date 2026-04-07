import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import CategoryNav from "../components/CategoryNav";
import { apiClient, endpoints, getImageUrl } from '../utils/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products when category or search changes
  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(endpoints.products.getAll);
      console.log("Products fetched:", response.data);
      setProducts(response.data.products || response.data);
      
      // Handle both response formats: array or object with products property
      let productsArray = [];
      if (Array.isArray(response.data)) {
        productsArray = response.data;
      } else if (response.data.products && Array.isArray(response.data.products)) {
        productsArray = response.data.products;
      }
      
      setProducts(productsArray);
      setFilteredProducts(productsArray);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!products.length) return;
    
    let filtered = [...products];

    // Filter by category - check if product.category matches selected category
    if (selectedCategory) {
      filtered = filtered.filter((product) => {
        const productCategoryId = product.category?._id || product.category;
        return productCategoryId === selectedCategory;
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          (product.title && product.title.toLowerCase().includes(term)) ||
          (product.description && product.description.toLowerCase().includes(term))
      );
    }

    console.log("Filtered products:", filtered.length);
    setFilteredProducts(filtered);
  };

  const handleCategorySelect = (categoryId) => {
    console.log("Selected category:", categoryId);
    setSelectedCategory(categoryId);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterReset = () => {
    setSelectedCategory("");
    setSearchTerm("");
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading products</h2>
        <p>{error}</p>
        <button onClick={fetchProducts}>Try Again</button>
      </div>
    );
  }

  // Make sure filteredProducts is always an array
  const productsToShow = Array.isArray(filteredProducts) ? filteredProducts : [];

  return (
    <div className="products-page">
      {/* Category Navigation Bar */}
      <CategoryNav
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
        onSearch={handleSearch}
        onFilterReset={handleFilterReset}
      />

      {/* Results Info */}
      <div className="results-info">
        <p>
          {productsToShow.length} product{productsToShow.length !== 1 ? "s" : ""} found
          {selectedCategory && " in selected category"}
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Products Grid */}
      {productsToShow.length === 0 ? (
        <div className="no-products">
          <p>No products found matching your criteria.</p>
          <button onClick={handleFilterReset} className="reset-btn">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {productsToShow.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;