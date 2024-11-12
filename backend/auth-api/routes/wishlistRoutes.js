// routes/wishlistRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const wishlistController = require("../controllers/wishlistController");

// Add product to wishlist
router.post("/add", authMiddleware, wishlistController.addToWishlist);

// Remove product from wishlist
router.delete("/remove", authMiddleware, wishlistController.removeFromWishlist);

// Get user's wishlist
router.get("/getWishlist", authMiddleware, wishlistController.getWishlist);

module.exports = router;
