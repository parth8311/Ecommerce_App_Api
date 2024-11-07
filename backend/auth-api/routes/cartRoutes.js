const express = require("express");
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const validateCart = require("../validations/cartValidation");

const router = express.Router();

router.post("/add", validateCart, addToCart); // Add item to cart
router.get("/getCart/:userId", getCart); // Get user's cart
router.put("/update", validateCart, updateCartItem); // Update item quantity in cart
router.delete("/remove", removeCartItem); // Remove item from cart
router.delete("/clear/:userId", clearCart); // Clear the cart

module.exports = router;
