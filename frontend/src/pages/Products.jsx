import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import CategoryNav from "../components/CategoryNav";
import { apiClient, endpoints } from "../utils/api";

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

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params for filtering
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);
      
      const url = params.toString() 
        ? `${endpoints.products.getAll}?${params}` 
        : endpoints.products.getAll;
      
      console.log("Fetching products from:", url);
      const response = await apiClient.get(url);
      console.log("Products API response:", response.data);
      
      // Handle different response formats
      let productsArray = [];
      if (response.data && Array.isArray(response.data.products)) {
        // Format: { products: [...], total: X, page: 1 }
        productsArray = response.data.products;
      } else if (Array.isArray(response.data)) {
        // Format: direct array
        productsArray = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Try to find any array property
        productsArray = Object.values(response.data).find(val => Array.isArray(val)) || [];
      }
      
      console.log("Products extracted:", productsArray.length);
      setProducts(productsArray);
      setFilteredProducts(productsArray);
    } catch (error) {
      console.error("Error fetching products:", error);
      console.error("Error response:", error.response?.data);
      setError(error.response?.data?.message || "Failed to fetch products");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!products.length) return;
    
    let filtered = [...products];

    if (selectedCategory) {
      const categoryId = selectedCategory;
      filtered = filtered.filter((product) => {
        const productCategoryId = product.category?._id || product.category;
        return productCategoryId === categoryId;
      });
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          (product.title && product.title.toLowerCase().includes(term)) ||
          (product.description && product.description.toLowerCase().includes(term))
      );
    }

    setFilteredProducts(filtered);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    // Refetch products with category filter
    fetchProducts();
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    // Refetch products with search term
    fetchProducts();
  };

  const handleFilterReset = () => {
    setSelectedCategory("");
    setSearchTerm("");
    fetchProducts();
  };

  if (loading) {
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
      />

      <div className="results-info">
        <p>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
          {selectedCategory && " in selected category"}
          {searchTerm && ` for "${searchTerm}"`}
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