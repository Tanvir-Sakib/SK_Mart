import { useState, useEffect, useCallback } from "react";
import ProductCard from "../components/ProductCard";
import CategoryNav from "../components/CategoryNav";
import { apiClient, endpoints } from "../utils/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products when debounced search or category changes
  useEffect(() => {
    if (!loading) {
      fetchProducts();
    }
  }, [debouncedSearch, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setSearchLoading(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
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
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setLoading(true);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setSearchLoading(true);
  };

  const handleFilterReset = () => {
    setSelectedCategory("");
    setSearchTerm("");
    setDebouncedSearch("");
    setLoading(true);
  };

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, []);

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
          {searchLoading ? "Searching..." : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""} found`}
          {selectedCategory && " in selected category"}
          {debouncedSearch && ` for "${debouncedSearch}"`}
        </p>
      </div>

      {filteredProducts.length === 0 ? (
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