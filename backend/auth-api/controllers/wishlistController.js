// controllers/wishlistController.js
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.body.productId;

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if wishlist exists for the user
    let wishlist = await Wishlist.findOne({ user: userId });

    // If no wishlist, create one
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    // If the product is not already in the wishlist, add it
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
      return res
        .status(200)
        .json({ message: "Product added to wishlist", wishlist });
    }

    return res
      .status(400)
      .json({ message: "Product is already in the wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add product to wishlist" });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.body.productId;

    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    // Remove the product from the wishlist
    const index = wishlist.products.indexOf(productId);
    if (index > -1) {
      wishlist.products.splice(index, 1);
      await wishlist.save();
      return res
        .status(200)
        .json({ message: "Product removed from wishlist", wishlist });
    }

    return res.status(400).json({ message: "Product not found in wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove product from wishlist" });
  }
};

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user's wishlist and populate the products
    const wishlist = await Wishlist.findOne({ user: userId }).populate(
      "products"
    );

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    return res.status(200).json({ wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};
