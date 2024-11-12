// const mongoose = require("mongoose");

// const inventorySchema = new mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Product",
//     required: true,
//   },
//   stock: {
//     type: Number,
//     required: true,
//     default: 0,
//   },
//   lastUpdated: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports =
//   mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema);

// models/inventory.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const inventorySchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  stock: { type: Number, required: true, default: 0 },
  availability: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema);
