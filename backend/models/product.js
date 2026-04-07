const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Category is required"],
  },
  stock: {
    type: Number,
    required: [true, "Stock is required"],
    min: 0,
    default: 0,
  },
  image: {
    type: String,
    required: [true, "Image is required"],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("product", productSchema);