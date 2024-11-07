const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Completed", "Canceled"],
  },
  createdAt: { type: Date, default: Date.now },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  paymentMethod: { type: String, default: "Credit Card" },
});

module.exports = mongoose.model("Order", orderSchema);
