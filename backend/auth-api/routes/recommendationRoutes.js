// routes/recommendationRoutes.js
const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");

// Get recommendations for a specific product
router.get("/products/:productId/recommendations", recommendationController.getRecommendations);

module.exports = router;
