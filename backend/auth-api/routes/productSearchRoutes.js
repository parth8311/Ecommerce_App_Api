// routes/productSearchRoutes.js
const express = require("express");
const router = express.Router();
const productSearchController = require("../controllers/productSearchController");

// Search products
router.get("/search", productSearchController.searchProducts);

module.exports = router;
