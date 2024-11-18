const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware"); // Ensure the user is authenticated

// Get user account information
router.get("/account", authMiddleware, userController.getUserAccountInfo);

// Add a new address
router.post("/account/address", authMiddleware, userController.addAddress);

// Get order history
router.get(
  "/account/order-history",
  authMiddleware,
  userController.getOrderHistory
);
// Update order status (admin or user depending on your logic)
router.put("/update-status", userController.updateOrderStatus);

module.exports = router;
