import React,{ useRef } from "react";
import html2pdf from "html2pdf.js";
import { formatPrice } from "../utils/currency";

const Invoice = ({ order, onClose }) => {
  const invoiceRef = useRef();

  const downloadPDF = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Invoice_${order._id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="invoice-modal">
      <div className="invoice-content">
        <div className="invoice-actions">
          <button onClick={downloadPDF} className="download-invoice-btn">
            📄 Download PDF
          </button>
          <button onClick={onClose} className="close-invoice-btn">
            ✕ Close
          </button>
        </div>
        
        <div ref={invoiceRef} className="invoice-paper">
          {/* Invoice Header */}
          <div className="invoice-header">
            <div className="company-info">
              <h1>🛍️ SK MART</h1>
              <p>123 Business Street</p>
              <p>Dhaka, Bangladesh 1000</p>
              <p>Email: info@skmart.com</p>
              <p>Phone: +880 1234567890</p>
            </div>
            <div className="invoice-title">
              <h2>INVOICE</h2>
              <p>Order #{order._id.slice(-8)}</p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Bill To Section */}
          <div className="bill-to">
            <h3>Bill To:</h3>
            <p><strong>{order.shippingAddress?.fullName}</strong></p>
            <p>{order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
            <p>Phone: {order.shippingAddress?.phone}</p>
            <p>Email: {order.shippingAddress?.email}</p>
          </div>

          {/* Order Items Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th>SL</th>
                <th>Item</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.product?.title}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price)}</td>
                  
                  <td>{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="invoice-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
               <span>Shipping Fee:</span>
              <span>
                {order.shippingFee === 0 ? (
                  <span className="free-shipping-text">Free</span>
                ) : (
                  `৳ ${order.shippingFee || 0}`
                )}
              </span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>{formatPrice(order.totalAmount)}</span>
             
            </div>
          </div>

          {/* Payment Info */}
          <div className="payment-info">
            <p><strong>Payment Method:</strong> {order.paymentMethod || "Cash on Delivery"}</p>
            <p><strong>Order Status:</strong> {order.status?.toUpperCase()}</p>
          </div>

          {/* Footer */}
          <div className="invoice-footer">
            <p>Thank you for shopping with SK MART!</p>
            <p>For any inquiries, please contact us at info@skmart.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;