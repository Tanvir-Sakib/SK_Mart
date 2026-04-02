const Cart = require("../models/cart");
const Product = require("../models/product");

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Validate product
    const product = await Product.findById(productId).populate("category", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Find user's cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    // Populate user and products
    const populatedCart = await Cart.findById(cart._id)
      .populate("user", "name email")
      .populate({
        path: "items.product",
        select: "title price image category",
        populate: { path: "category", select: "name" },
      });

    res.json(populatedCart);
  } catch (err) {
    console.error("ADD TO CART ERROR:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId })
      .populate("user", "name email")
      .populate({
        path: "items.product",
        select: "title price image category",
        populate: { path: "category", select: "name" },
      });

    if (!cart) return res.status(404).json({ message: "Cart is empty" });

    res.json(cart);
  } catch (err) {
    console.error("GET CART ERROR:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Remove product from cart
exports.removeItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate("user", "name email")
      .populate({
        path: "items.product",
        select: "title price image category",
        populate: { path: "category", select: "name" },
      });

    res.json(populatedCart);
  } catch (err) {
    console.error("REMOVE ITEM ERROR:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Increment product quantity in cart
exports.incrementQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params; // FIXED: get from params

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1)
      return res.status(404).json({ message: "Product not in cart" });

    cart.items[itemIndex].quantity += 1;

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate("user", "name email")
      .populate({
        path: "items.product",
        select: "title price image category",
        populate: { path: "category", select: "name" },
      });

    res.json(populatedCart);
  } catch (err) {
    console.error("INCREMENT CART ERROR:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Decrement product quantity in cart
exports.decrementQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params; // FIXED: get from params

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1)
      return res.status(404).json({ message: "Product not in cart" });

    // If quantity > 1, decrement, else remove item
    if (cart.items[itemIndex].quantity > 1) {
      cart.items[itemIndex].quantity -= 1;
    } else {
      cart.items.splice(itemIndex, 1);
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate("user", "name email")
      .populate({
        path: "items.product",
        select: "title price image category",
        populate: { path: "category", select: "name" },
      });

    res.json(populatedCart);
  } catch (err) {
    console.error("DECREMENT CART ERROR:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.json({ message: "Cart cleared successfully" });
  } catch (err) {
    console.error("CLEAR CART ERROR:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};