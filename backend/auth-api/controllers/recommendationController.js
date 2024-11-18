// controllers/recommendationController.js
const Product = require("../models/Product");

exports.getRecommendations = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find similar products in the same category, excluding the current product
    const similarProducts = await Product.find({
      category: product.category,
      _id: { $ne: productId }
    }).limit(5);

    // Find popular products, sorted by views (excluding the current product)
    const popularProducts = await Product.find({
      _id: { $ne: productId }
    })
      .sort({ views: -1 })
      .limit(5);

    res.status(200).json({
      similarProducts,
      popularProducts
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
};
