const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    let totalAmount = 0;

    const orderItems = cart.items.map((item) => {
      totalAmount += item.product.price * item.quantity;

      return {
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      };
    });

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
    });

    // Clear cart after order placed
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
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
      .populate("user", "name email");

    res.json(orders);
  } catch (err) {
    console.error("GET USER ORDERS ERROR:", err);
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
      });

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

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err);

    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
