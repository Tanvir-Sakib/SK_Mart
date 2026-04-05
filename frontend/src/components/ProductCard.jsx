import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { formatPrice } from "../utils/currency";


function ProductCard({ product }) {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const { addToCart, loading } = useContext(CartContext);
  const [adding, setAdding] = useState(false);

  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
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

  const imageUrl = product.image
    ? `http://localhost:5000${product.image}`
    : "https://via.placeholder.com/300x300?text=No+Image";

  return (
    <div className="product-card">
      <div onClick={handleProductClick} style={{ cursor: 'pointer' }}>
        <div className="product-image-container">
          <img
            src={imageUrl}
            alt={product.title}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x300?text=Image+Not+Found";
            } } />
        </div>
        <h3>{product.title}</h3>
        <p className="price">{formatPrice(product.price)}</p>
        <p className="category">{product.category?.name || "Uncategorized"}</p>
      </div>
      <button
        className="add-to-cart-btn"
        onClick={handleAddToCart}
        disabled={adding || loading}
      >
        {adding ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}

export default ProductCard;