const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  }],
  subtotal: {
    type: Number,
    required: true,
  },
  shippingFee: {
    type: Number,
    required: true,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    postalCode: String,
    phone: String,
    email: String,
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "bkash", "nagad"],
    default: "cash",
  },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Order", orderSchema);