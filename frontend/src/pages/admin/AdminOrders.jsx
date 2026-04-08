import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { apiClient, endpoints, getImageUrl } from "../../utils/api";
import "./Admin.css";

const AdminOrders = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(endpoints.orders.admin.getAll);
      console.log("Admin Orders response:", response.data);
      
      // Ensure orders is an array - handle different response formats
      let ordersData = [];
      if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.data && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object, try to extract orders from common property names
        ordersData = response.data.orders || response.data.items || [];
      }
      
      console.log("Processed orders:", ordersData.length);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.response?.data?.message || "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await apiClient.put(
        endpoints.orders.admin.updateStatus(orderId),
        { status }
      );
      alert("Order status updated successfully!");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(error.response?.data?.message || "Failed to update order status");
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

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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

  if (!orders || orders.length === 0) {
    return (
      <div className="admin-container">
        <h1>Manage Orders</h1>
        <div className="no-orders">
          <p>No orders found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1>Manage Orders</h1>

      <div className="orders-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order._id}>
                <tr className="order-row" onClick={() => toggleExpand(order._id)}>
                  <td>#{order._id?.slice(-8) || "N/A"}</td>
                  <td>
                    <strong>{order.user?.name || "N/A"}</strong><br/>
                    <small>{order.user?.email || "N/A"}</small>
                  </td>
                  <td>
                    {order.items?.length || 0} item(s)
                    <br/>
                    <small className="view-details">Click to view details</small>
                  </td>
                  <td>৳ {order.totalAmount || order.total || 0}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {order.status || "pending"}
                    </span>
                  </td>
                  <td>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                   </td>
                  <td>
                    <select
                      value={order.status || "pending"}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="status-select"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                   </td>
                 </tr>
                {expandedOrder === order._id && (
                  <tr className="order-details-row">
                    <td colSpan="7">
                      <div className="order-products-details">
                        <h3>Order Items</h3>
                        <div className="products-list">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, index) => (
                              <div key={item.product?._id || index} className="order-product-item">
                                <img 
                                    src={imgError ? FALLBACK_IMAGE : getImageUrl(product.image)} 
                                    alt={product.title}
                                    onError={() => setImgError(true)}
                                  />
                                <div className="product-info">
                                  <h4>{item.product?.title || "Unknown Product"}</h4>
                                  <p className="product-description">{item.product?.description || "No description"}</p>
                                  <p className="product-category">Category: {item.product?.category?.name || "Uncategorized"}</p>
                                  <div className="product-meta">
                                    <span>Quantity: {item.quantity || 0}</span>
                                    <span>Price: ৳ {item.price || 0}</span>
                                    <span>Subtotal: ৳ {(item.price || 0) * (item.quantity || 0)}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p>No items found for this order</p>
                          )}
                        </div>
                        
                        {order.shippingAddress && (
                          <div className="shipping-info">
                            <h3>Shipping Address</h3>
                            <div className="address-details">
                              <p><strong>{order.shippingAddress.fullName || "N/A"}</strong></p>
                              <p>{order.shippingAddress.address || "N/A"}</p>
                              <p>{order.shippingAddress.city || "N/A"}, {order.shippingAddress.postalCode || ""}</p>
                              <p>📞 {order.shippingAddress.phone || "N/A"}</p>
                              <p>📧 {order.shippingAddress.email || "N/A"}</p>
                              <p>💳 Payment: {order.paymentMethod || "Cash on Delivery"}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;