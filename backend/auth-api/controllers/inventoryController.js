const Inventory = require("../models/Inventory");
const Product = require("../models/Product"); // Assuming a Product model exists

// Check if product is available (in stock)
exports.checkProductAvailability = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check stock availability
    const isAvailable = product.stock > 0;

    res.status(200).json({
      isAvailable,
      stock: product.stock,
      availability: product.availability,
    });
  } catch (error) {
    console.error("Error checking product availability:", error);
    res.status(500).json({ error: "Error checking product availability" });
  }
};

// Get stock levels for a specific product
exports.getProductStockLevel = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
      productId: product._id,
      stock: product.stock,
      name: product.name,
      price: product.price,
      availability: product.availability,
    });
  } catch (error) {
    console.error("Error fetching product stock levels:", error);
    res.status(500).json({ error: "Error fetching product stock levels" });
  }
};

// Update stock levels (for restocking or reducing stock)
exports.updateProductStock = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || typeof quantity !== "number") {
    return res
      .status(400)
      .json({ error: "Please provide productId and quantity" });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update stock and availability
    product.stock += quantity;
    product.availability = product.stock > 0;

    // Only update averageRating if necessary, prevent setting to 0
    if (product.averageRating === 0) {
      product.averageRating = 1; // Set to minimum default or null, as preferred
    }

    await product.save();

    res.status(200).json({
      message: "Product stock updated successfully",
      stock: product.stock,
      availability: product.availability,
    });
  } catch (error) {
    console.error("Error updating product stock:", error);
    res
      .status(500)
      .json({ error: "Error updating product stock", details: error.message });
  }
};

// const Inventory = require("../models/Inventory");
// const Product = require("../models/Product"); // If you want to fetch product details if necessary

// // Check Inventory for a specific product
// exports.checkInventory = async (req, res) => {
//   const { productId } = req.params;

//   try {
//     // Find the inventory record for the given productId
//     const inventory = await Inventory.findOne({ productId });

//     if (!inventory) {
//       return res
//         .status(404)
//         .json({ error: "Inventory record not found for this product" });
//     }

//     res.status(200).json({
//       productId: inventory.productId,
//       stock: inventory.stock,
//       availability: inventory.availability,
//     });
//   } catch (error) {
//     console.error("Error checking inventory:", error);
//     res
//       .status(500)
//       .json({ error: "Error checking inventory", details: error.message });
//   }
// };

// // Get Stock Levels for a specific product
// exports.getStockLevel = async (req, res) => {
//   const { productId } = req.params;

//   try {
//     const inventory = await Inventory.findOne({ productId });

//     if (!inventory) {
//       return res
//         .status(404)
//         .json({ error: "Inventory record not found for this product" });
//     }

//     res.status(200).json({
//       productId: inventory.productId,
//       stock: inventory.stock,
//     });
//   } catch (error) {
//     console.error("Error getting stock level:", error);
//     res
//       .status(500)
//       .json({ error: "Error getting stock level", details: error.message });
//   }
// };

// // Update Inventory Stock (Restock or Reduce Stock)

// // Update stock by adding the received quantity to the existing stock
// exports.updateInventoryStock = async (req, res) => {
//   const { productId, quantity } = req.body;

//   // Validate the request
//   if (!productId || typeof quantity !== "number") {
//     return res
//       .status(400)
//       .json({ error: "Please provide productId and quantity" });
//   }

//   try {
//     // Find the inventory record associated with the product
//     let inventory = await Inventory.findOne({ productId });

//     // If no inventory record exists, create one
//     if (!inventory) {
//       inventory = new Inventory({
//         productId,
//         stock: quantity,
//         availability: quantity > 0,
//       });
//     } else {
//       // Update the stock by adding the quantity
//       inventory.stock += quantity;
//       inventory.availability = inventory.stock > 0;
//     }

//     await inventory.save();

//     res.status(200).json({
//       message: "Inventory stock updated successfully",
//       stock: inventory.stock,
//       availability: inventory.availability,
//     });
//   } catch (error) {
//     console.error("Error updating inventory stock:", error);
//     res.status(500).json({
//       error: "Error updating inventory stock",
//       details: error.message,
//     });
//   }
// };
