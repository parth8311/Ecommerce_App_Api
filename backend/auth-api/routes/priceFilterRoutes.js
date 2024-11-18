// routes/priceFilterRoutes.js
const express = require("express");
const router = express.Router();
const priceFilterController = require("../controllers/priceFilterController");

// Route to filter products by price
router.get("/products/filter", priceFilterController.filterByPrice);

module.exports = router;
