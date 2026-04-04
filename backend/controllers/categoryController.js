const Category = require("../models/category");

// Admin-only: Create new category
exports.createCategory = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user); // Debug
    console.log("REQ.BODY:", req.body);

    const { name } = req.body;

    // Validate input
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Prevent duplicate categories
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Create category
    const category = await Category.create({ name: name.trim() });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (err) {
    console.error("CREATE CATEGORY ERROR:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};



// Get all categories (public)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Get single category
exports.getSingleCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    console.error("GET SINGLE CATEGORY ERROR:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};



exports.updateCategory = async (req,res)=>{

try{

const updatedCategory = await Category.findByIdAndUpdate(
req.params.id,
req.body,
{ new:true }
);

res.json(updatedCategory);

}catch(err){

res.status(500).json(err);

}};



exports.deleteCategory = async (req,res)=>{

try{

await Category.findByIdAndDelete(req.params.id);

res.json("Category deleted successfully");

}catch(err){

res.status(500).json(err);

}};