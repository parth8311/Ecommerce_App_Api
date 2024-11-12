// controllers/productSearchController.js
const Product = require("../models/Product");

// Product Search by keyword, category, and filters
exports.searchProducts = async (req, res) => {
  try {
    const { keyword, category, priceRange, rating } = req.query;

    // Build the query based on search parameters
    let searchQuery = {};

    // If keyword is provided, search in name and description fields
    if (keyword) {
      searchQuery.$or = [
        { name: { $regex: keyword, $options: "i" } }, // Case-insensitive search
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    // If category is provided, filter by category
    if (category) {
      searchQuery.category = category;
    }

    // If priceRange is provided, filter by price
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split(",").map(Number);
      searchQuery.price = { $gte: minPrice, $lte: maxPrice };
    }

    // If rating is provided, filter by rating
    if (rating) {
      searchQuery.rating = { $gte: Number(rating) };
    }

    // Execute the search query
    const products = await Product.find(searchQuery);

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    return res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred during product search" });
  }
};
