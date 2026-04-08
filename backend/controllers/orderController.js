const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");
const ShippingSettings = require("../models/shippingSettings");

// Calculate shipping fee based on dynamic settings
const calculateShippingFee = async (city, subtotal) => {
  try {
    const settings = await ShippingSettings.getInstance();
    
    // Check free shipping
    if (settings.freeShippingEnabled && subtotal >= settings.freeShippingThreshold) {
      return 0;
    }
    
    // Find city rate (case insensitive)
    const cityRate = settings.cityRates.find(rate => 
      rate.city.toLowerCase() === city?.toLowerCase()
    );
    
    return cityRate ? cityRate.fee : settings.defaultFee;
  } catch (error) {
    console.error("Error calculating shipping fee:", error);
    return 100; // Default fallback fee
  }
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    // Get user's cart with populated products
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;
    const orderItems = [];

    // Check stock and prepare order items
    for (const item of cart.items) {
      const product = item.product;
      
      // Check if enough stock
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.title}. Available: ${product.stock}` 
        });
      }
      
      subtotal += product.price * item.quantity;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
      
      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate shipping fee based on city and subtotal
    const city = shippingAddress?.city || "";
    const shippingFee = await calculateShippingFee(city, subtotal);
    const totalAmount = subtotal + shippingFee;

    // Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      subtotal: subtotal,
      shippingFee: shippingFee,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || "cash",
      status: "pending",
    });

    // Clear the cart after order is placed
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: order,
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Get orders of logged-in user
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "title price image category")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("GET USER ORDERS ERROR:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Delete/Cancel order (user can cancel their own order)
exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if order belongs to the user
    if (order.user.toString() !== userId) {
      return res.status(403).json({ message: "You can only cancel your own orders" });
    }
    
    // Only allow cancellation of pending orders
    if (order.status !== "pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }
    
    // Restore stock when cancelling
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
    
    await Order.findByIdAndDelete(orderId);
    
    res.json({ 
      success: true, 
      message: "Order cancelled successfully" 
    });
  } catch (err) {
    console.error("DELETE ORDER ERROR:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Admin - Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate({
        path: "items.product",
        select: "title price image category",
        populate: { path: "category", select: "name" },
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Admin - Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If cancelling, restore stock
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};