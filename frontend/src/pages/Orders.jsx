import React,{ useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiClient, endpoints, getImageUrl } from "../utils/api";
import Invoice from "../components/Invoice";
import { FALLBACK_IMAGE } from "../utils/constants";

const Orders = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [imgErrors, setImgErrors] = useState({});
  
  const handleImageError = (productId) => {
    setImgErrors(prev => ({ ...prev, [productId]: true }));
  };

  const getProductImageUrl = (product) => {
    if (imgErrors[product?._id]) return FALLBACK_IMAGE;
    return getImageUrl(product?.image);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(endpoints.orders.myOrders);
      console.log("Orders response:", response.data);
      
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
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    // Confirm deletion
    const confirmed = window.confirm(
      "Are you sure you want to delete this order? This action cannot be undone."
    );
    
    if (!confirmed) return;
    
    setDeletingId(orderId);
    
    try {
      await apiClient.delete(`${endpoints.orders.myOrders}/${orderId}`);
      alert("Order deleted successfully!");
      
      // Remove the deleted order from state
      setOrders(orders.filter(order => order._id !== orderId));
    } catch (error) {
      console.error("Error deleting order:", error);
      alert(error.response?.data?.message || "Failed to delete order");
    } finally {
      setDeletingId(null);
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

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Orders</h2>
        <p>{error}</p>
        <button onClick={fetchOrders}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>
      
      {!orders || orders.length === 0 ? (
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
                  <span className="order-id">Order #{order._id?.slice(-8) || "N/A"}</span>
                  <span className={`order-status ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status?.toUpperCase() || "PENDING"}
                  </span>
                </div>
                <div className="order-date">
                  📅 {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                </div>
              </div>
              
              {/* Shipping Address Section */}
              {order.shippingAddress && (
                <div className="order-shipping-address">
                  <h3>📮 Shipping Address</h3>
                  <div className="address-details">
                    <p><strong>{order.shippingAddress.fullName || "N/A"}</strong></p>
                    <p>{order.shippingAddress.address || "N/A"}</p>
                    <p>{order.shippingAddress.city || "N/A"}, {order.shippingAddress.postalCode || ""}</p>
                    <p>📞 {order.shippingAddress.phone || "N/A"}</p>
                    <p>📧 {order.shippingAddress.email || "N/A"}</p>
                  </div>
                </div>
              )}
              
              <div className="order-items">
                <h3>🛍️ Items</h3>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={item.product?._id || index} className="order-item">
                      <img 
                        src={imgError ? FALLBACK_IMAGE : getImageUrl(product.image)} 
                        alt={product.title}
                        onError={() => setImgError(true)}
                      />
                      <div className="order-item-details">
                        <h4>{item.product?.title || "Unknown Product"}</h4>
                        <p>Quantity: {item.quantity || 0}</p>
                        <p>Price: ৳ {item.price || 0}</p>
                      </div>
                      <div className="order-item-total">
                        ৳ {(item.price || 0) * (item.quantity || 0)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-items">No items found for this order</p>
                )}
              </div>
              
              <div className="order-footer">
                <div className="order-payment">
                  <strong>Payment Method:</strong> {order.paymentMethod || "Cash on Delivery"}
                </div>
                <div className="order-total">
                  <strong>Total Amount:</strong> ৳ {order.totalAmount || order.total || 0}
                </div>
                <div className="order-actions">
                  <button 
                    className="invoice-btn"
                    onClick={() => handleDownloadInvoice(order)}
                  >
                    📄 Download Invoice
                  </button>
                  <button 
                    className={`delete-order-btn ${order.status !== "pending" ? "disabled" : ""}`}
                    onClick={() => handleDeleteOrder(order._id)}
                    disabled={deletingId === order._id || order.status !== "pending" || order.status === "cancelled"}
                  >
                    {deletingId === order._id ? "Cancelling..." : "🗑️ Cancel Order"}
                  </button>
                </div>
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