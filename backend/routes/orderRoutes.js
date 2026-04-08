const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Checkout
router.post("/", authMiddleware, createOrder);

// User order history
router.get("/my-orders", authMiddleware, getMyOrders);

// User - Delete order
router.delete("/my-orders/:id", authMiddleware, deleteOrder);

// Admin order panel
router.get("/", authMiddleware, adminMiddleware, getAllOrders);

// Admin - Update order status
router.put("/my-orders/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);
module.exports = router;