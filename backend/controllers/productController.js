const Product = require("../models/product");
const Category = require("../models/category");

// Admin-only: create a product
exports.createProduct = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    // Check if using FormData (with file) or JSON
    let title, description, price, category, stock, image;
    
    if (req.file) {
      // FormData submission
      title = req.body.title;
      description = req.body.description;
      price = Number(req.body.price);
      category = req.body.category;
      stock = Number(req.body.stock);
      image = `/uploads/${req.file.filename}`;
    } else {
      // JSON submission
      title = req.body.title;
      description = req.body.description;
      price = Number(req.body.price);
      category = req.body.category;
      stock = Number(req.body.stock);
      image = req.body.image || "/uploads/default.jpg";
    }
    
    // Validate required fields
    if (!title || !description || !price || !category || stock === undefined) {
      return res.status(400).json({ 
        message: "All fields are required",
        missing: { 
          title: !title, 
          description: !description, 
          price: !price, 
          category: !category, 
          stock: stock === undefined 
        }
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Create product
    const product = await Product.create({
      title,
      description,
      price,
      category,
      stock,
      image,
    });

    // Populate category for response
    const populatedProduct = await Product.findById(product._id).populate("category", "name");

    res.status(201).json({
      success: true,
      product: populatedProduct,
    });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ 
      message: err.message || "Internal Server Error", 
      error: err.message 
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