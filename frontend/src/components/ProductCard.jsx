import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { getImageUrl } from "../utils/api";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const { addToCart, loading } = useContext(CartContext);
  const [adding, setAdding] = useState(false);

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

  // Simple image URL - NO imgError
  const imageUrl = getImageUrl(product.image);

  return (
    <div className="product-card" onClick={handleProductClick}>
      <div className="product-image-container">
        <img src={imageUrl} alt={product.title} />
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