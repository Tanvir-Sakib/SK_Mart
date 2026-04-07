const Product = require("../models/product");
const Category = require("../models/category");

exports.createProduct = async (req, res) => {
  console.log("=== CREATE PRODUCT ===");
  console.log("Content-Type:", req.headers['content-type']);
  console.log("Body:", req.body);
  console.log("File:", req.file);
  
  try {
    let title, description, price, category, stock, image;
    
    // Handle both JSON and FormData
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // FormData with file
      title = req.body.title;
      description = req.body.description;
      price = Number(req.body.price);
      category = req.body.category;
      stock = Number(req.body.stock);
      image = req.file ? `/uploads/${req.file.filename}` : null;
    } else {
      // JSON
      title = req.body.title;
      description = req.body.description;
      price = Number(req.body.price);
      category = req.body.category;
      stock = Number(req.body.stock);
      image = req.body.image;
    }
    
    console.log("Parsed:", { title, description, price, category, stock, image });
    
    // Simple validation
    if (!title) return res.status(400).json({ error: "Title required" });
    if (!description) return res.status(400).json({ error: "Description required" });
    if (!price) return res.status(400).json({ error: "Price required" });
    if (!category) return res.status(400).json({ error: "Category required" });
    if (stock === undefined) return res.status(400).json({ error: "Stock required" });
    
    // Check category
    const catExists = await Category.findById(category);
    if (!catExists) return res.status(404).json({ error: "Category not found" });
    
    // Create product
    const product = await Product.create({
      title: title.trim(),
      description: description.trim(),
      price: price,
      category: category,
      stock: stock,
      image: image || "/uploads/default.jpg"
    });
    
    const populated = await Product.findById(product._id).populate("category", "name");
    
    res.status(201).json({ success: true, product: populated });
    
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name").sort({ createdAt: -1 });
    res.json({ products, total: products.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updates = {};
    if (req.body.title) updates.title = req.body.title;
    if (req.body.description) updates.description = req.body.description;
    if (req.body.price) updates.price = Number(req.body.price);
    if (req.body.category) updates.category = req.body.category;
    if (req.body.stock !== undefined) updates.stock = Number(req.body.stock);
    if (req.file) updates.image = `/uploads/${req.file.filename}`;
    
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true }).populate("category", "name");
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};