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

  // Filter products when category or search changes
  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(endpoints.products.getAll);
      console.log("Products API response:", response.data);
      
      // IMPORTANT FIX: Extract products array from response
      let productsArray = [];
      if (response.data && Array.isArray(response.data.products)) {
        // This is your case - response has { products: [...] }
        productsArray = response.data.products;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        productsArray = response.data;
      } else {
        console.error("Unexpected response format:", response.data);
        productsArray = [];
      }
      
      console.log("Products extracted:", productsArray.length);
      setProducts(productsArray);
      setFilteredProducts(productsArray);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!products.length) return;
    
    let filtered = [...products];

    // Filter by category
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