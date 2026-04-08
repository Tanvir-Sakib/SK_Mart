import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { apiClient, endpoints, getImageUrl } from "../utils/api";


const [imgError, setImgError] = useState(false);

// In the img tag
<img 
  src={imgError ? FALLBACK_IMAGE : getImageUrl(product.image)} 
  alt={product.title}
  onError={() => setImgError(true)}
/>

const ProductDetail = () => {
  const { id } = useParams(); // Make sure this matches the route parameter name
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    console.log("Product ID from URL:", id); // Debug log
    if (id) {
      fetchProduct();
    } else {
      setError("No product ID provided");
      setLoading(false);
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.products.getSingle(id));
      console.log("Product fetched:", response.data);
      
      // Handle response format - if it's wrapped in a products property
      let productData = response.data;
      if (response.data && response.data.product) {
        productData = response.data.product;
      }
      
      setProduct(productData);
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(error.response?.data?.message || "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    setAdding(true);
    const success = await addToCart(product._id, quantity);
    setAdding(false);
    
    if (success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const updateQuantity = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  if (loading) return <div className="loading">Loading product...</div>;
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Product</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
        <button onClick={fetchProduct}>Try Again</button>
      </div>
    );
  }
  
  if (!product) return <div className="error">Product not found</div>;

  return (
    <div className="product-detail-container">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back to Products
      </button>

      <div className="product-detail">
        <div className="product-image">
          <img 
            src={getImageUrl(product.image)} 
            alt={product.title}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/500x500?text=No+Image";
            }}
          />
        </div>

        <div className="product-info">
          <h1>{product.title}</h1>
          <p className="category">
            Category: {product.category?.name || "Uncategorized"}
          </p>
          <p className="price">৳ {product.price}</p>
          <p className="description">{product.description}</p>
          <p className={`stock ${product.stock === 0 ? "out-of-stock" : ""}`}>
            {product.stock === 0 ? "Out of Stock" : `In Stock: ${product.stock} units`}
          </p>

          {product.stock > 0 && (
            <>
              <div className="quantity-selector">
                <label>Quantity: </label>
                <button 
                  onClick={() => updateQuantity(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => updateQuantity(1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <button 
                onClick={handleAddToCart} 
                className="add-to-cart-btn"
                disabled={adding}
              >
                {adding ? "Adding to Cart..." : "Add to Cart"}
              </button>
            </>
          )}

          {addedToCart && (
            <div className="success-message">
              ✓ Product added to cart successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;