import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { apiClient, endpoints, getImageUrl } from "../utils/api";

const Checkout = () => {
  const { cart, cartCount, clearCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [shippingSettings, setShippingSettings] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingFeeDetails, setShippingFeeDetails] = useState("");

  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    email: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Fetch saved addresses and shipping settings on load
  useEffect(() => {
    fetchSavedAddresses();
    fetchShippingSettings();
  }, []);

  // Recalculate shipping fee when city or subtotal changes
  useEffect(() => {
    if (shippingSettings && shippingDetails.city) {
      calculateShippingFee();
    }
  }, [shippingDetails.city, cart, shippingSettings]);

  const fetchShippingSettings = async () => {
    try {
      const response = await apiClient.get(endpoints.admin.shippingSettings.get);
      setShippingSettings(response.data);
    } catch (error) {
      console.error("Error fetching shipping settings:", error);
    }
  };

  const fetchSavedAddresses = async () => {
    try {
      const response = await apiClient.get("/api/auth/addresses");
      setSavedAddresses(response.data);
      
      // Find default address
      const defaultAddress = response.data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
        setShippingDetails({
          fullName: defaultAddress.fullName,
          address: defaultAddress.address,
          city: defaultAddress.city,
          postalCode: defaultAddress.postalCode || "",
          phone: defaultAddress.phone,
          email: defaultAddress.email
        });
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const calculateSubtotal = () => {
    if (!cart.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const calculateShippingFee = () => {
    if (!shippingSettings) return;
    
    const subtotal = calculateSubtotal();
    const city = shippingDetails.city;
    
    // Check free shipping threshold
    if (shippingSettings.freeShippingEnabled && subtotal >= shippingSettings.freeShippingThreshold) {
      setShippingFee(0);
      setShippingFeeDetails(`Free Shipping (Order over ৳${shippingSettings.freeShippingThreshold})`);
      return;
    }
    
    // Find city rate
    const cityRate = shippingSettings.cityRates?.find(
      rate => rate.city.toLowerCase() === city?.toLowerCase()
    );
    
    if (cityRate) {
      setShippingFee(cityRate.fee);
      setShippingFeeDetails(`Shipping to ${city}: ৳${cityRate.fee}`);
    } else {
      setShippingFee(shippingSettings.defaultFee || 100);
      setShippingFeeDetails(`Standard Shipping: ৳${shippingSettings.defaultFee || 100}`);
    }
  };

  const calculateTotal = () => {
    return calculateSubtotal() + shippingFee;
  };

  const handleSelectAddress = (addressId) => {
    const address = savedAddresses.find(addr => addr._id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setShippingDetails({
        fullName: address.fullName,
        address: address.address,
        city: address.city,
        postalCode: address.postalCode || "",
        phone: address.phone,
        email: address.email
      });
    }
  };

  const handleInputChange = (e) => {
    setShippingDetails({
      ...shippingDetails,
      [e.target.name]: e.target.value
    });
    setSelectedAddressId("");
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!shippingDetails.fullName || !shippingDetails.address || 
        !shippingDetails.city || !shippingDetails.phone) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      const subtotal = calculateSubtotal();
      const total = subtotal + shippingFee;
      
      const orderData = {
        shippingAddress: shippingDetails,
        paymentMethod: paymentMethod,
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        subtotal: subtotal,
        shippingFee: shippingFee,
        totalAmount: total
      };

      await apiClient.post(endpoints.orders.create, orderData);
      setOrderPlaced(true);
      await clearCart();
      
      setTimeout(() => navigate("/orders"), 2000);
    } catch (error) {
      console.error("Order placement error:", error);
      alert(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="order-success">
        <div className="success-icon">✓</div>
        <h2>Order Placed Successfully!</h2>
        <p>Redirecting to your orders...</p>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate("/")} className="continue-shopping-btn">Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="checkout-wrapper">
      <div className="checkout-container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <div className="shipping-section">
            <h2>Shipping Information</h2>
            
            {/* Saved Addresses Dropdown */}
            {savedAddresses.length > 0 && (
              <div className="saved-addresses">
                <label>Select a saved address:</label>
                <select value={selectedAddressId} onChange={(e) => handleSelectAddress(e.target.value)}>
                  <option value="">-- Select saved address --</option>
                  {savedAddresses.map(addr => (
                    <option key={addr._id} value={addr._id}>
                      {addr.isDefault ? "⭐ " : ""}{addr.fullName} - {addr.address}, {addr.city}
                    </option>
                  ))}
                </select>
                <p className="or-text">OR fill in manually:</p>
              </div>
            )}
            
            <form onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" name="fullName" value={shippingDetails.fullName} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" value={shippingDetails.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="tel" name="phone" value={shippingDetails.phone} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Address *</label>
                <input type="text" name="address" value={shippingDetails.address} onChange={handleInputChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input type="text" name="city" value={shippingDetails.city} onChange={handleInputChange} required 
                    placeholder="Enter city" />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input type="text" name="postalCode" value={shippingDetails.postalCode} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="cash">Cash on Delivery</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                </select>
              </div>
            </form>
          </div>

          <div className="order-summary-section">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cart.items.map((item) => (
                <div key={item.product?._id} className="summary-item">
                  <img src={getImageUrl(item.product?.image)} alt={item.product?.title} />
                  <div className="summary-item-details">
                    <h4>{item.product?.title}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>৳ {item.product?.price}</p>
                  </div>
                  <div className="summary-item-total">৳ {(item.product?.price || 0) * item.quantity}</div>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>৳ {calculateSubtotal()}</span>
              </div>
              <div className="summary-row shipping-fee">
                <span>Shipping Fee:</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="free-shipping">Free Shipping!</span>
                  ) : (
                    `৳ ${shippingFee}`
                  )}
                </span>
              </div>
              {/* {shippingFeeDetails && shippingFee > 0 && (
                <div className="shipping-details">
                  <small>{shippingFeeDetails}</small>
                </div>
              )} */}
              <div className="summary-row total">
                <span>Total:</span>
                <span>৳ {calculateTotal()}</span>
              </div>
            </div>
            <button className="place-order-btn" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;