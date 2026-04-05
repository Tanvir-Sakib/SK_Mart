const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    default: function() {
      return this.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("category", categorySchema);