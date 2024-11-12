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
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  estimatedCost: { type: Number }, // New field for estimated cost
  status: {
    type: String,
    enum: [
      "Pending",
      "Processing",
      "Placed",
      "Cancelled",
      "Delivered",
      "Returned",
    ],
    default: "Pending",
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
  tracker: {
    status: {
      type: String,
      enum: [
        "Pending",
        "In Transit",
        "Out for Delivery",
        "Delivered",
        "Returned",
      ],
      default: "Pending",
    },
    currentLocation: String,
    estimatedDeliveryTime: Date,
  },
});

module.exports = mongoose.model("Order", orderSchema);
