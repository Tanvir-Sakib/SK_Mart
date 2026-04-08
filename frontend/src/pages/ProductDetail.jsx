import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { apiClient, endpoints, getImageUrl } from "../utils/api";
import { FALLBACK_IMAGE } from "../utils/constants";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.products.getSingle(id));
      setProduct(response.data);
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

  const imageUrl = imgError ? FALLBACK_IMAGE : getImageUrl(product?.image);

  if (loading) return <div className="loading">Loading product...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Product not found</div>;

  return (
    <div className="product-detail-container">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back to Products
      </button>

      <div className="product-detail">
        <div className="product-image">
          <img 
            src={imageUrl}
            alt={product.title}
            onError={() => setImgError(true)}
          />
        </div>

        <div className="product-info">
          <h1>{product.title}</h1>
          <p className="category">Category: {product.category?.name || "Uncategorized"}</p>
          <p className="price">৳ {product.price}</p>
          <p className="description">{product.description}</p>
          <p className={`stock ${product.stock === 0 ? "out-of-stock" : ""}`}>
            {product.stock === 0 ? "Out of Stock" : `In Stock: ${product.stock} units`}
          </p>

          {product.stock > 0 && (
            <>
              <div className="quantity-selector">
                <label>Quantity: </label>
                <button onClick={() => updateQuantity(-1)} disabled={quantity <= 1}>-</button>
                <span>{quantity}</span>
                <button onClick={() => updateQuantity(1)} disabled={quantity >= product.stock}>+</button>
              </div>
              <button onClick={handleAddToCart} className="add-to-cart-btn" disabled={adding}>
                {adding ? "Adding to Cart..." : "Add to Cart"}
              </button>
            </>
          )}

          {addedToCart && (
            <div className="success-message">✓ Product added to cart successfully!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;