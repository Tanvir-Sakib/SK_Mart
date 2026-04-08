import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { getImageUrl } from "../utils/api";


const [imgError, setImgError] = useState(false);

// In the img tag
<img 
  src={imgError ? FALLBACK_IMAGE : getImageUrl(product.image)} 
  alt={product.title}
  onError={() => setImgError(true)}
/>
const Cart = () => {
  const { 
    cart, 
    cartCount, 
    removeFromCart, 
    incrementQuantity,
    decrementQuantity,
    loading 
  } = useContext(CartContext);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const calculateTotal = () => {
    if (!cart.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.product?.price || 0) * (item.quantity || 0);
    }, 0);
  };

  const handleIncrement = async (productId) => {
    console.log("Increment clicked for:", productId);
    if (incrementQuantity) {
      await incrementQuantity(productId);
    } else {
      console.error("incrementQuantity is undefined");
    }
  };

  const handleDecrement = async (productId) => {
    console.log("Decrement clicked for:", productId);
    if (decrementQuantity) {
      await decrementQuantity(productId);
    } else {
      console.error("decrementQuantity is undefined");
    }
  };

  const handleRemove = async (productId) => {
    console.log("Remove clicked for:", productId);
    if (removeFromCart) {
      await removeFromCart(productId);
    } else {
      console.error("removeFromCart is undefined");
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <p>Add some products to your cart to see them here.</p>
        <button onClick={() => navigate("/")} className="continue-shopping-btn">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Shopping Cart ({cartCount} items)</h1>
      
      <div className="cart-items">
        <div className="cart-header">
          <span>Product</span>
          <span>Price</span>
          <span>Quantity</span>
          <span>Total</span>
          <span></span>
        </div>
        
        {cart.items.map((item) => (
          <div key={item.product?._id} className="cart-item">
            <div className="cart-item-product">
              <img 
                src={getImageUrl(item.product?.image)} 
                alt={item.product?.title}
                onError={(e) => e.target.src = "https://placehold.co/80x80?text=No+Image"}
              />
              <div>
                <h4>{item.product?.title}</h4>
                <p className="category">{item.product?.category?.name}</p>
              </div>
            </div>
            
            <div className="cart-item-price">
              ৳ {item.product?.price}
            </div>
            
            <div className="cart-item-quantity">
              <button 
                onClick={() => handleDecrement(item.product?._id)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button 
                onClick={() => handleIncrement(item.product?._id)}
                disabled={item.quantity >= item.product?.stock}
              >
                +
              </button>
            </div>
            
            <div className="cart-item-total">
              ৳ {(item.product?.price || 0) * (item.quantity || 0)}
            </div>
            
            <button 
              className="remove-btn"
              onClick={() => handleRemove(item.product?._id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      
      <div className="cart-summary">
        <div className="summary-details">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>৳ {calculateTotal()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>৳ {calculateTotal()}</span>
          </div>
        </div>
        <button className="checkout-btn" onClick={handleCheckout}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;