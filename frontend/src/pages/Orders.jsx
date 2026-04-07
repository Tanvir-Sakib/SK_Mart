import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { formatPrice } from "../utils/currency";
import {apiClient, endpoints, getImageUrl} from '../utils/api';
import axios from "axios";
import Invoice from "../components/Invoice";

const Orders = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

// In the fetchOrders function, add safety checks
const fetchOrders = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await apiClient.get(endpoints.orders.admin.getAll);
    console.log("Orders response:", response.data);
    
    // Ensure orders is an array
    let ordersData = [];
    if (Array.isArray(response.data)) {
      ordersData = response.data;
    } else if (response.data && Array.isArray(response.data.orders)) {
      ordersData = response.data.orders;
    }
    
    setOrders(ordersData);
  } catch (error) {
    console.error("Error fetching orders:", error);
    setError(error.response?.data?.message || "Failed to fetch orders");
    setOrders([]);
  } finally {
    setLoading(false);
  }
};

  const getStatusColor = (status) => {
    switch(status) {
      case "pending": return "status-pending";
      case "processing": return "status-processing";
      case "shipped": return "status-shipped";
      case "delivered": return "status-delivered";
      case "cancelled": return "status-cancelled";
      default: return "";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "pending": return "⏳";
      case "processing": return "🔄";
      case "shipped": return "📦";
      case "delivered": return "✅";
      case "cancelled": return "❌";
      default: return "📋";
    }
  };

  const handleDownloadInvoice = (order) => {
    setSelectedOrder(order);
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="orders-container">
      <h1>My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => window.location.href = "/"} className="shop-now-btn">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <span className="order-id">Order #{order._id.slice(-8)}</span>
                  <span className={`order-status ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status.toUpperCase()}
                  </span>
                </div>
                <div className="order-date">
                  📅 {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              {/* Shipping Address Section */}
              {order.shippingAddress && (
                <div className="order-shipping-address">
                  <h3>📮 Shipping Address</h3>
                  <div className="address-details">
                    <p><strong>{order.shippingAddress.fullName}</strong></p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    <p>📞 {order.shippingAddress.phone}</p>
                    <p>📧 {order.shippingAddress.email}</p>
                  </div>
                </div>
              )}
              
              <div className="order-items">
                <h3>🛍️ Items</h3>
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img src={getImageUrl(item.product?.image)} 
                    alt={item.product?.title}
                      onError={(e) => e.target.src = "https://via.placeholder.com/60x60?text=No+Image"}
                    />
                    <div className="order-item-details">
                      <h4>{item.product?.title}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p className="price">{formatPrice(item.price)}</p>
                    </div>
                    <div className="order-item-total">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-footer">
                <div className="order-payment">
                  <strong>Payment Method:</strong> {order.paymentMethod || "Cash on Delivery"}
                </div>
                <div className="order-total">
                  <strong>Total Amount:</strong> {formatPrice(order.totalAmount || order.total)}
                  
                </div>
                <button 
                  className="invoice-btn"
                  onClick={() => handleDownloadInvoice(order)}
                >
                  📄 Download Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedOrder && (
        <Invoice 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};

export default Orders;