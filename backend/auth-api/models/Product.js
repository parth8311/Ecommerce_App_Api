// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
//   price: {
//     type: Number,
//     required: true,
//   },
//   stock: {
//     type: Number,
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Product = mongoose.model("Product", productSchema);
// module.exports = Product;
const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  averageRating: { type: Number, min: 1, default: 1 },

  reviewCount: {
    type: Number,
    default: 0,
  },
  //stock: { type: Number, required: true, default: 0 }, // Quantity of stock available
  availability: { type: Boolean, default: true },
  category: {
    type: String,
    required: true, // Set as required if each product must belong to a category
  },
  image: {
    type: String, // This field could store the URL of the product image
    required: true, // Set as required if each product must have an image
  },
  views: { type: Number, default: 0 }, // Number of views to track popularity
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
