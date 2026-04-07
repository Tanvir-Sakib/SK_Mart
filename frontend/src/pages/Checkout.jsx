import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { formatPrice } from "../utils/currency";
import { apiClient, endpoints } from '../utils/api';
import axios from "axios";

const Checkout = () => {
  const { cart, cartCount, clearCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    email: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("cash");

  const calculateTotal = () => {
    if (!cart.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const handleInputChange = (e) => {
    setShippingDetails({
      ...shippingDetails,
      [e.target.name]: e.target.value
    });
  };

const handlePlaceOrder = async (e) => {
  e.preventDefault();
  
  // Validate shipping details
  if (!shippingDetails.fullName || !shippingDetails.address || 
      !shippingDetails.city || !shippingDetails.phone) {
    alert("Please fill in all required fields");
    return;
  }

  setLoading(true);
  
  try {
    const orderData = {
      shippingAddress: shippingDetails,
      paymentMethod: paymentMethod,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      totalAmount: calculateTotal()
    };

    const response = await apiClient.post(endpoints.orders.create, orderData, {
      headers: { 
        Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Order placed:", response.data);
    
    // Clear cart in frontend context
    await clearCart(); // This should clear the cart in your CartContext
    
    setOrderPlaced(true);
    
    // Redirect to orders page after 2 seconds
    setTimeout(() => {
      navigate("/orders");
    }, 2000);
    
  } catch (error) {
    console.error("Order placement error:", error);
    alert(error.response?.data?.message || "Failed to place order. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="checkout-wrapper">
      <div className="checkout-container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          {/* Shipping Form */}
          <div className="shipping-section">
            <h2>Shipping Information</h2>
            <form onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingDetails.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={shippingDetails.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingDetails.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={shippingDetails.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your street address"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingDetails.city}
                    onChange={handleInputChange}
                    required
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={shippingDetails.postalCode}
                    onChange={handleInputChange}
                    placeholder="Postal code"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="payment-select"
                >
                  <option value="cash">Cash on Delivery</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                </select>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cart.items.map((item) => (
                <div key={item.product?._id} className="summary-item">
                  <img src={getImageUrl(item.product?.image)} 
                  alt={item.product?.title}
                  />
                  <div className="summary-item-details">
                    <h4>{item.product?.title}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>{formatPrice(item.product?.price)}</p>
                    
                  </div>
                  <div className="summary-item-total">
                    {formatPrice((item.product?.price || 0) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
            </div>

            <button 
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;