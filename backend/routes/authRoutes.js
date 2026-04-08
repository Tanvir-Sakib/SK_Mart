const User = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");
const {
registerUser,
loginUser
} = require("../controllers/authController");

router.post("/register",registerUser);
router.post("/login",loginUser);

// Update user profile
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    console.log("Updating profile for user:", userId);
    console.log("New data:", { name, email });

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use by another account" });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Profile updated successfully:", user);
    res.json({ 
      message: "Profile updated successfully", 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Change password
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    console.log("Password change request for user:", userId);

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash and update password manually
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    console.log("Password changed successfully for user:", userId);
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ========== ADDRESS MANAGEMENT ==========

// Get all addresses
router.get("/addresses", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new address
router.post("/addresses", authMiddleware, async (req, res) => {
  try {
    const { fullName, address, city, postalCode, phone, email, isDefault } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // If this is default, remove default from others
    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }
    
    user.addresses.push({ fullName, address, city, postalCode, phone, email, isDefault });
    await user.save();
    
    res.status(201).json({ message: "Address added successfully", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update address
router.put("/addresses/:addressId", authMiddleware, async (req, res) => {
  try {
    const { fullName, address, city, postalCode, phone, email, isDefault } = req.body;
    const user = await User.findById(req.user.id);
    
    const addressToUpdate = user.addresses.id(req.params.addressId);
    if (!addressToUpdate) {
      return res.status(404).json({ message: "Address not found" });
    }
    
    // If this is default, remove default from others
    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }
    
    addressToUpdate.fullName = fullName;
    addressToUpdate.address = address;
    addressToUpdate.city = city;
    addressToUpdate.postalCode = postalCode;
    addressToUpdate.phone = phone;
    addressToUpdate.email = email;
    addressToUpdate.isDefault = isDefault;
    
    await user.save();
    res.json({ message: "Address updated successfully", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete address
router.delete("/addresses/:addressId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.pull({ _id: req.params.addressId });
    await user.save();
    res.json({ message: "Address deleted successfully", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Set default address
router.put("/addresses/:addressId/default", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Remove default from all
    user.addresses.forEach(addr => { addr.isDefault = false; });
    
    // Set new default
    const address = user.addresses.id(req.params.addressId);
    if (address) {
      address.isDefault = true;
    }
    
    await user.save();
    res.json({ message: "Default address set", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;