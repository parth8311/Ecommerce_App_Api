const Order = require("../models/Order");

// Helper function to calculate estimated cost (items, shipping cost, and tax)
function calculateEstimatedCost(items, shippingCost, taxRate) {
  let itemCost = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  let tax = itemCost * taxRate;
  return itemCost + tax + shippingCost;
}

exports.placeOrder = async (req, res) => {
  const {
    items,
    totalAmount,
    address,
    paymentMethod,
    shippingCost = 10,
    taxRate = 0.1,
  } = req.body;
  try {
    const estimatedCost = calculateEstimatedCost(items, shippingCost, taxRate);

    const newOrder = new Order({
      user: req.user.id, // This requires req.user to be populated
      items,
      totalAmount,
      estimatedCost,
      address,
      paymentMethod,
      shippingCost,
      tax: estimatedCost * taxRate,
    });

    const order = await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to place order", error: error.message });
  }
};

// Update order status to "Placed" after shop accepts it
exports.acceptOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: "Placed" },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order accepted", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to accept order", error: error.message });
  }
};

//cancelOrder
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Shipped" || order.status === "Delivered") {
      return res
        .status(400)
        .json({ message: "Cannot cancel order after shipment" });
    }

    order.status = "Cancelled";
    order.cancellationDate = new Date();
    await order.save();

    // Refund process if paid online
    if (order.paymentStatus === "Paid") {
      order.paymentStatus = "Refunded";
      order.refunded = true;
      // Implement actual refund logic here (bank transfer, GPay, etc.)
    }

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error cancelling order", error: error.message });
  }
};

//track order
exports.trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Example tracker details
    res.status(200).json({
      orderId: order._id,
      currentLocation: order.status === "Shipped" ? "In Transit" : order.status,
      estimatedDeliveryTime: order.status === "Shipped" ? "2024-11-10" : "N/A",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error tracking order", error: error.message });
  }
};

// Confirm order delivery
exports.confirmDelivery = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Find the order and update fields related to delivery
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "Delivered",
        paymentStatus: "Paid", // Assuming online payment is completed
        "tracker.currentLocation": "Customer Location",
        "tracker.status": "Delivered",
        cancellationAllowed: false,
        updatedAt: Date.now(),
      },
      { new: true } // Return the updated document
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Order delivered",
      order,
    });
  } catch (error) {
    console.error("Error delivering order:", error); // Log the full error for debugging

    return res.status(500).json({
      message: "Server error",
      error: error.message || "An unexpected error occurred",
    });
  }
};
// Return order
exports.returnOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const returnDeadline = new Date(order.returnDeadline);
    if (Date.now() > returnDeadline) {
      return res.status(400).json({ message: "Return period expired" });
    }

    order.status = "Returned";
    order.refunded = true;
    // Implement refund logic (bank transfer/GPay here)
    order.paymentStatus = "Refunded";

    await order.save();
    res
      .status(200)
      .json({ message: "Order returned and refund processed", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing return", error: error.message });
  }
};
