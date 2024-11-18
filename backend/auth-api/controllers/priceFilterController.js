// controllers/priceFilterController.js
const Product = require("../models/Product");

exports.filterByPrice = async (req, res) => {
  const { minPrice, maxPrice } = req.query;

  try {
    // Convert minPrice and maxPrice to numbers
    const min = parseFloat(minPrice) || 0; // Default to 0 if not provided
    const max = parseFloat(maxPrice) || Infinity; // Default to no upper limit if not provided

    // Query products within the price range
    const products = await Product.find({
      price: { $gte: min, $lte: max },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error filtering products by price:", error);
    res.status(500).json({ error: "Failed to filter products by price" });
  }
};
