require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./auth-api/config/db");
const authRoutes = require("./auth-api/routes/authRoutes");
const {
  hashPassword,
  comparePassword,
} = require("./auth-api/utils/hashPassword");
const { generateToken } = require("./auth-api/utils/tokenService");
const productRoutes = require("./auth-api/routes/productRoutes");
// const cartRoutes = require("./auth-api/routes/cartRoutes");
// const orderRoutes = require("./auth-api/routes/orderRoutes");
const userRoutes = require("./auth-api/routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use("/api/products", productRoutes);
// app.use("/api/cart", cartRoutes);

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
// app.use("/api/orders", orderRoutes);

// Password hashing and comparison endpoints
app.post("/hash-password", async (req, res) => {
  const { password } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    res.json({ hashedPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/compare-password", async (req, res) => {
  const { password, hashedPassword } = req.body;
  try {
    const isMatch = await comparePassword(password, hashedPassword);
    res.json({ isMatch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Token generation endpoint
app.post("/generate-token", (req, res) => {
  const { userId } = req.body;
  const token = generateToken(userId);
  res.json({ token });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
