const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Address Schema - NO pre-save hooks
const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, default: "" },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  addresses: { type: [addressSchema], default: [] }
}, { timestamps: true });

// Hash password before saving - FIXED
userSchema.pre("save", function(next) {
  // 'this' refers to the user document being saved
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("user", userSchema);