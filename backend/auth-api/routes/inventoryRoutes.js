const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController"); // Ensure this path is correct
const authMiddleware = require("../middleware/authMiddleware"); // Ensure authentication if needed

// Check Product Availability and Stock
router.get(
  "/inventory/:productId",
  inventoryController.checkProductAvailability
);

// Get Product Stock Levels
router.get(
  "/inventory/stock/:productId",
  inventoryController.getProductStockLevel
);

// Update Product Stock (Restocking or Reducing)
router.post("/inventory/update", inventoryController.updateProductStock);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const inventoryController = require("../controllers/inventoryController");

// // Endpoint to check product availability
// router.get("/inventory/:productId", inventoryController.checkInventory);

// // Endpoint to get the current stock level of a product
// //router.get("/inventory/stock/:productId", inventoryController.getStockLevel);

// // Endpoint to update stock levels
// router.post("/inventory/update", inventoryController.updateInventoryStock);

// module.exports = router;
