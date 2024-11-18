const express = require("express");
// const { authMiddleware } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");
// const { placeOrder, acceptOrder, cancelOrder, trackOrder } = require('../controllers/orderController');

const router = express.Router();

// Place an order
// router.post("/place", authMiddleware, placeOrder);

const authMiddleware = require("../middleware/authMiddleware");
// Get all orders for a user
router.get("/get-order", authMiddleware, orderController.getUserOrders);

// Track an order
// router.get("/:orderId/track", trackOrder);

// Accept an order
// router.put("/:orderId/accept", acceptOrder);

// Cancel an order
// router.put("/:orderId/cancel", cancelOrder);

// Confirm delivery
// router.put("/:orderId/deliver", orderController.confirmDelivery);

// Return an order
// router.put("/:orderId/return", orderController.returnOrder);

// module.exports = router

// const express = require("express");

// const router = express.Router();
const {
  placeOrder,
  acceptOrder,
  cancelOrder,
  trackOrder,
  confirmDelivery,
  returnOrder,
} = require("../controllers/orderController");

router.post("/place", authMiddleware, placeOrder);
router.put("/:orderId/accept", authMiddleware, acceptOrder);
router.put("/:orderId/cancel", authMiddleware, cancelOrder);
router.get("/:orderId/track", authMiddleware, trackOrder);
router.put("/:orderId/delivered", authMiddleware, confirmDelivery);
router.put("/:orderId/return", authMiddleware, returnOrder);

module.exports = router;
