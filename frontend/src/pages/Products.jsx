import React, { useState, useEffect, useCallback, useRef } from 'react';
import ProductCard from "../components/ProductCard";
import CategoryNav from "../components/CategoryNav";
import { apiClient, endpoints } from "../utils/api";

const [imgError, setImgError] = useState(false);

// In the img tag
<img 
  src={imgError ? FALLBACK_IMAGE : getImageUrl(product.image)} 
  alt={product.title}
  onError={() => setImgError(true)}
/>

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Fetch products based on search and category
  const fetchProducts = useCallback(async () => {
    try {
      setIsSearching(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      if (selectedCategory) params.append("category", selectedCategory);
      
      const url = params.toString() 
        ? `${endpoints.products.getAll}?${params}` 
        : endpoints.products.getAll;
      
      console.log("Fetching products from:", url);
      const response = await apiClient.get(url);
      
      // Extract products array
      let productsArray = [];
      if (response.data && Array.isArray(response.data.products)) {
        productsArray = response.data.products;
      } else if (Array.isArray(response.data)) {
        productsArray = response.data;
      }
      
      setProducts(productsArray);
      setFilteredProducts(productsArray);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchProducts();
      }
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchProducts]);

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setLoading(true);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterReset = () => {
    setSelectedCategory("");
    setSearchTerm("");
    setLoading(true);
  };

  if (loading && products.length === 0) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Products</h2>
        <p>{error}</p>
        <button onClick={fetchProducts}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="products-page">
      <CategoryNav
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
        onSearch={handleSearch}
        onFilterReset={handleFilterReset}
        searchTerm={searchTerm}
      />

      <div className="results-info">
        <p>
          {isSearching ? "Searching..." : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""} found`}
          {selectedCategory && " in selected category"}
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {filteredProducts.length === 0 && !isSearching ? (
        <div className="no-products">
          <p>No products found matching your criteria.</p>
          <button onClick={handleFilterReset} className="reset-btn">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;