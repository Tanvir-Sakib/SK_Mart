const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const User = require("../models/user");
const Order = require("../models/order");
const Product = require("../models/product");
const Category = require("../models/category");
const ShippingSettings = require("../models/shippingSettings");

// ✅ Use Cloudinary instead of local multer
const { upload } = require("../config/cloudinary");

// Apply middlewares
router.use(authMiddleware);
router.use(adminMiddleware);

// ========== PRODUCT MANAGEMENT ==========
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Create product - WITH CLOUDINARY UPLOAD
router.post("/products", upload.single("image"), async (req, res) => {
  try {
    console.log("Creating product with:", req.body);
    console.log("Cloudinary file:", req.file);
    
    const { title, description, price, category, stock } = req.body;
    
    // req.file.path contains the full Cloudinary URL
    const imageUrl = req.file ? req.file.path : null;
    
    if (!imageUrl) {
      return res.status(400).json({ message: "Image is required" });
    }
    
    const product = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image: imageUrl  // This is the full Cloudinary URL
    });
    
    const populatedProduct = await Product.findById(product._id).populate("category", "name");
    res.status(201).json({ success: true, product: populatedProduct });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ UPDATE product - WITH OPTIONAL CLOUDINARY UPLOAD
router.put("/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, description, price, category, stock } = req.body;
    
    const updateData = {
      title,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
    };
    
    // If new image uploaded, use Cloudinary URL
    if (req.file) {
      updateData.image = req.file.path;  // Full Cloudinary URL
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("category", "name");
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    console.error("Update product error:", error);
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
    res.json({ success: true, message: "Product deleted" });
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
    const category = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/categories/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
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
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
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
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
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

// ========== SHIPPING SETTINGS MANAGEMENT ==========
router.get("/shipping-settings", async (req, res) => {
  try {
    const settings = await ShippingSettings.getInstance();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/shipping-settings", async (req, res) => {
  try {
    const { freeShippingThreshold, cityRates, defaultFee, freeShippingEnabled } = req.body;
    
    let settings = await ShippingSettings.findOne();
    if (!settings) {
      settings = new ShippingSettings();
    }
    
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = freeShippingThreshold;
    if (cityRates !== undefined) settings.cityRates = cityRates;
    if (defaultFee !== undefined) settings.defaultFee = defaultFee;
    if (freeShippingEnabled !== undefined) settings.freeShippingEnabled = freeShippingEnabled;
    settings.updatedBy = req.user.id;
    
    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add city rate
router.post("/shipping-settings/city", async (req, res) => {
  try {
    const { city, fee } = req.body;
    const settings = await ShippingSettings.getInstance();
    
    settings.cityRates.push({ city, fee });
    await settings.save();
    
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update city rate
router.put("/shipping-settings/city/:cityId", async (req, res) => {
  try {
    const { fee } = req.body;
    const settings = await ShippingSettings.getInstance();
    
    const cityRate = settings.cityRates.id(req.params.cityId);
    if (cityRate) {
      cityRate.fee = fee;
      await settings.save();
    }
    
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete city rate
router.delete("/shipping-settings/city/:cityId", async (req, res) => {
  try {
    const settings = await ShippingSettings.getInstance();
    settings.cityRates.pull({ _id: req.params.cityId });
    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;