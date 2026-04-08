import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { getImageUrl } from "../utils/api";

// A simple data:image SVG placeholder (no external request)
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f0f0f0'/%3E%3Ctext x='150' y='140' font-family='Arial' font-size='16' fill='%23999' text-anchor='middle'%3ENo Image%3C/text%3E%3Ctext x='150' y='165' font-family='Arial' font-size='12' fill='%23bbb' text-anchor='middle'%3EAvailable%3C/text%3E%3C/svg%3E";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const { addToCart, loading } = useContext(CartContext);
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }
    
    setAdding(true);
    await addToCart(product._id, 1);
    setAdding(false);
  };

  const imageUrl = imgError ? FALLBACK_IMAGE : getImageUrl(product.image);

  return (
    <div className="product-card" onClick={handleProductClick}>
      <div className="product-image-container">
        <img 
          src={imageUrl}
          alt={product.title}
          onError={() => setImgError(true)}
        />
      </div>
      <h3>{product.title}</h3>
      <p className="price">৳ {product.price}</p>
      <p className="category">{product.category?.name || "Uncategorized"}</p>
      <button 
        className="add-to-cart-btn"
        onClick={handleAddToCart}
        disabled={adding || loading}
      >
        {adding ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductCard;