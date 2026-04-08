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

  const updateOrderStatus = async (orderId, status) => {
    try {
      await apiClient.put(endpoints.orders.admin.updateStatus(orderId), { status });
      alert("Order status updated!");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
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

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-container">
      <h1>Manage Orders</h1>

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
                <td>{order.items?.length || 0} item(s)</td>
                <td>৳ {order.totalAmount || 0}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(order.status)}`}>
                    {order.status || "pending"}
                  </span>
                </td>
                <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</td>
                <td>
                  <select
                    value={order.status || "pending"}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
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
                        {order.items?.map((item, index) => (
                          <div key={item.product?._id || index} className="order-product-item">
                            <img 
                              src={getImageUrl(item.product?.image)} 
                              alt={item.product?.title || "Product"}
                            />
                            <div className="product-info">
                              <h4>{item.product?.title || "Unknown Product"}</h4>
                              <p>Quantity: {item.quantity || 0}</p>
                              <p>Price: ৳ {item.price || 0}</p>
                              <p>Subtotal: ৳ {(item.price || 0) * (item.quantity || 0)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {order.shippingAddress && (
                        <div className="shipping-info">
                          <h3>Shipping Address</h3>
                          <p><strong>{order.shippingAddress.fullName}</strong></p>
                          <p>{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                          <p>📞 {order.shippingAddress.phone}</p>
                          <p>💳 Payment: {order.paymentMethod || "Cash on Delivery"}</p>
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
  );
};

export default AdminOrders;