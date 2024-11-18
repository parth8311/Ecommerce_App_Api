// const mongoose = require("mongoose");

// const orderItemSchema = new mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Product",
//     required: true,
//   },
//   quantity: { type: Number, required: true },
//   price: { type: Number, required: true },
// });

// const orderSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   items: [
//     {
//       productId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Product",
//         required: true,
//       },
//       quantity: { type: Number, required: true },
//       price: { type: Number, required: true },
//     },
//   ],
//   totalAmount: { type: Number, required: true },
//   estimatedCost: { type: Number }, // New field for estimated cost
//   status: {
//     type: String,
//     enum: [
//       "Pending",
//       "Processing",
//       "Placed",
//       "Cancelled",
//       "Delivered",
//       "Returned",
//     ],
//     default: "Pending",
//   },
//   createdAt: { type: Date, default: Date.now },
//   address: {
//     street: String,
//     city: String,
//     state: String,
//     zip: String,
//     country: String,
//   },
//   paymentMethod: { type: String, default: "Credit Card" },
//   tracker: {
//     status: {
//       type: String,
//       enum: [
//         "Pending",
//         "In Transit",
//         "Out for Delivery",
//         "Delivered",
//         "Returned",
//       ],
//       default: "Pending",
//     },
//     currentLocation: String,
//     estimatedDeliveryTime: Date,
//   },
// });

// module.exports = mongoose.model("Order", orderSchema);

const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: Number,
    estimatedCost: Number,
    address: String,
    paymentMethod: { type: String, enum: ["COD", "Online"], default: "COD" },
    shippingCost: Number,
    tax: Number,
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid", "Refunded"],
      default: "Unpaid",
    },
    deliveredAt: Date,
    cancellationDate: Date,
    returnDeadline: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }, // 7 days from now
    refundInitiatedAt: Date, // When refund was initiated
    refundProcessedAt: Date, // When refund was processed
    refunded: { type: Boolean, default: false }, // Indicates refund status
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
