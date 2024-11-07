const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const validateProduct = require("../validations/productValidation");

const router = express.Router();

// Routes for product CRUD operations
router.post("/addProduct", validateProduct, createProduct); // Create product
router.get("/getProduct", getProducts); // Get all products
router.get("/getProductId/:id", getProductById); // Get a single product by ID
router.put("/updateProduct/:id", validateProduct, updateProduct); // Update product
router.delete("/deleteProduct/:id", deleteProduct); // Delete product

module.exports = router;
