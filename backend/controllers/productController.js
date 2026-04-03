const Product = require("../models/product");
const Category = require("../models/category");

// Admin-only: create a product
exports.createProduct = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { title, description, price, category, stock } = req.body;
    
    // Validate required fields
    if (!title || !description || !price || !category || !stock) {
      return res.status(400).json({ 
        message: "All fields are required",
        missing: { title: !title, description: !description, price: !price, category: !category, stock: !stock }
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Create product with the full image path including extension
    const product = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image: `/uploads/${req.file.filename}`, // This will now have extension
    });

    // Populate category for response
    const populatedProduct = await Product.findById(product._id).populate(
      "category",
      "name"
    );

    res.status(201).json({
      success: true,
      product: populatedProduct,
      imageUrl: `http://localhost:5000/uploads/${req.file.filename}`
    });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: err.message 
    });
  }
};

// Get all products with populated category name
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Get single product with category
exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("GET SINGLE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Admin-only: update product
exports.updateProduct = async (req, res) => {
  try {
    // Optional: handle image update if file exists
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }

    // If category is being updated, check existence
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("category", "name");

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Admin-only: delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};