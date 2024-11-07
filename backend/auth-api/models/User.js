const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
  country: String,
});

const orderSchema = new mongoose.Schema({
  orderId: String,
  product: String,
  quantity: Number,
  price: Number,
  orderDate: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedAddresses: [addressSchema],
  orderHistory: [orderSchema],
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
