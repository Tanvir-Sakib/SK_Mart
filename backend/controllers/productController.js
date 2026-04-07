const Product = require("../models/product");
const Category = require("../models/category");
const multer = require("multer");
const path = require("path");

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

// Admin-only: create a product
exports.createProduct = async (req, res) => {
  try {
    console.log("=== CREATE PRODUCT DEBUG ===");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Body:", req.body);
    console.log("File:", req.file);
    
    // Extract fields - they come as strings in FormData
    const title = req.body.title;
    const description = req.body.description;
    const price = parseFloat(req.body.price);
    const category = req.body.category;
    const stock = parseInt(req.body.stock);
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
    
    console.log("Parsed data:", { title, description, price, category, stock, image });
    
    // Validate required fields
    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!description) missingFields.push("description");
    if (isNaN(price)) missingFields.push("price");
    if (!category) missingFields.push("category");
    if (isNaN(stock)) missingFields.push("stock");
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missing: missingFields
      });
    }
    
    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    // Create product
    const product = await Product.create({
      title: title.trim(),
      description: description.trim(),
      price: price,
      category: category,
      stock: stock,
      image: image || "/uploads/default.jpg"
    });
    
    const populatedProduct = await Product.findById(product._id).populate("category", "name");
    
    console.log("Product created:", populatedProduct);
    
    res.status(201).json({
      success: true,
      product: populatedProduct
    });
    
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ 
      message: err.message,
      stack: err.stack 
    });
  }
};

// Admin-only: update product
exports.updateProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock, image } = req.body;
    
    // Check if category exists if being updated
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    const updateData = {
      title,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
    };

    // Only update image if provided
    if (image) {
      updateData.image = image;
    }
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("category", "name");

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      success: true,
      product: updatedProduct
    });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};