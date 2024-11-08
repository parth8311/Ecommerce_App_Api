const express = require("express");
const router = express.Router();

// Import authController correctly
const authController = require("../controllers/authController"); // Make sure this path is correct
const authMiddleware = require("../middleware/authMiddleware");

// Routes
router.post("/register", authController.registerUser);
router.post("/verify-otp", authController.verifyOtp);
router.post("/login", authController.loginUser);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authMiddleware, authController.logoutUser);

module.exports = router;
