// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 0 },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Create index on name and description for faster search
productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
