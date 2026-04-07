const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const User = require("../models/user");
const Order = require("../models/order");
const Product = require("../models/product");
const Category = require("../models/category");

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Apply both middlewares - order matters! First auth, then admin
router.use(authMiddleware);
router.use(adminMiddleware);

// ========== PRODUCT MANAGEMENT ==========
// Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product - WITH FILE UPLOAD
router.post("/products", upload.single("image"), async (req, res) => {
  try {
    console.log("Creating product with:", req.body);
    console.log("Uploaded file:", req.file);
    
    const { title, description, price, category, stock } = req.body;
    
    // Create product with image path
    const product = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image: req.file ? `/uploads/${req.file.filename}` : "/uploads/default.jpg"
    });
    
    const populatedProduct = await Product.findById(product._id).populate("category", "name");
    
    res.status(201).json({
      success: true,
      product: populatedProduct
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE product - WITH OPTIONAL FILE UPLOAD
router.put("/products/:id", upload.single("image"), async (req, res) => {
  try {
    console.log("Updating product ID:", req.params.id);
    console.log("Update data:", req.body);
    console.log("Uploaded file:", req.file);
    
    const { title, description, price, category, stock } = req.body;
    
    const updateData = {
      title,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
    };
    
    // Only add image if a new file was uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("category", "name");
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    console.log("Product updated successfully:", product);
    res.json({
      success: true,
      product: product
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE product
router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== CATEGORY MANAGEMENT ==========
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }
    
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/categories/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== ORDER MANAGEMENT ==========
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "title price image")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== USER MANAGEMENT ==========
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== DASHBOARD STATS ==========
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCategories = await Category.countDocuments();
    
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");
    
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } });
    
    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      recentOrders,
      lowStockCount: lowStockProducts.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;