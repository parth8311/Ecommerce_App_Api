const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const {
  placeOrder,
  acceptOrder,
  cancelOrder,
  trackOrder,
  confirmDelivery,
  returnOrder,
} = require("../controllers/orderController");

router.post("/place", authMiddleware, placeOrder);
router.put("/:orderId/accept", acceptOrder);
router.put("/:orderId/cancel", cancelOrder);
router.get("/:orderId/track", trackOrder);
router.put("/:orderId/delivered", confirmDelivery);
router.put("/:orderId/return", returnOrder);

module.exports = router;
