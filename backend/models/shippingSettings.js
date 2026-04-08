const mongoose = require("mongoose");

const shippingSettingsSchema = new mongoose.Schema({
  // Free shipping threshold
  freeShippingThreshold: {
    type: Number,
    default: 5000,
    required: true,
  },
  // City-based shipping rates
  cityRates: [{
    city: {
      type: String,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
  // Default shipping fee for cities not listed
  defaultFee: {
    type: Number,
    default: 100,
    required: true,
  },
  // Enable/disable free shipping
  freeShippingEnabled: {
    type: Boolean,
    default: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, {
  timestamps: true,
});

// Singleton - only one settings document
shippingSettingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      cityRates: [
        { city: "Dhaka", fee: 60 },
        { city: "Chattogram", fee: 80 },
      ],
    });
  }
  return settings;
};

module.exports = mongoose.model("shippingSettings", shippingSettingsSchema);