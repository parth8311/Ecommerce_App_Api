const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  savedAddresses: [
    {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
  ],
  orderHistory: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      date: { type: Date, default: Date.now },
      status: String,
      totalAmount: Number,
      items: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          quantity: Number,
          price: Number,
        },
      ],
    },
  ],
});

// Ensure that the model is compiled correctly
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
