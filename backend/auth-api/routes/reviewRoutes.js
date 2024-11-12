const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // Ensure authentication middleware is set up
const reviewController = require("../controllers/reviewController");

// Create a Review (Requires Authentication)
router.post("/reviews", authMiddleware, reviewController.createReview);

// Get Reviews for a Product
router.get("/reviews/:productId", reviewController.getProductReviews);

// Get Average Rating for a Product
router.get(
  "/reviews/average/:productId",
  reviewController.getProductAverageRating
);

module.exports = router;
