const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware"); // Ensure the user is authenticated

// Get order history
router.get("/history", authMiddleware, orderController.getOrderHistory);

// Checkout process
router.post("/checkout", authMiddleware, orderController.checkout);

module.exports = router;
