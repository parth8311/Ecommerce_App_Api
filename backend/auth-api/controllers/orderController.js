// const Order = require("../models/Order");

// // Helper function to calculate estimated cost (items, shipping cost, and tax)
// function calculateEstimatedCost(items, shippingCost, taxRate) {
//   let itemCost = items.reduce(
//     (acc, item) => acc + item.price * item.quantity,
//     0
//   );
//   let tax = itemCost * taxRate;
//   return itemCost + tax + shippingCost;
// }

// exports.placeOrder = async (req, res) => {
//   const {
//     items,
//     totalAmount,
//     address,
//     paymentMethod,
//     shippingCost = 10,
//     taxRate = 0.1,
//   } = req.body;
//   try {
//     const estimatedCost = calculateEstimatedCost(items, shippingCost, taxRate);

//     const newOrder = new Order({
//       user: req.user.id, // This requires req.user to be populated
//       items,
//       totalAmount,
//       estimatedCost,
//       address,
//       paymentMethod,
//       shippingCost,
//       tax: estimatedCost * taxRate,
//     });

//     const order = await newOrder.save();
//     res.status(201).json({ message: "Order placed successfully", order });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Failed to place order", error: error.message });
//   }
// };

// // Update order status to "Placed" after shop accepts it
// exports.acceptOrder = async (req, res) => {
//   const { orderId } = req.params;
//   try {
//     const order = await Order.findByIdAndUpdate(
//       orderId,
//       { status: "Placed" },
//       { new: true }
//     );
//     if (!order) return res.status(404).json({ message: "Order not found" });
//     res.status(200).json({ message: "Order accepted", order });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Failed to accept order", error: error.message });
//   }
// };

// //cancelOrder
// exports.cancelOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const order = await Order.findById(orderId);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (order.status === "Shipped" || order.status === "Delivered") {
//       return res
//         .status(400)
//         .json({ message: "Cannot cancel order after shipment" });
//     }

//     order.status = "Cancelled";
//     order.cancellationDate = new Date();
//     await order.save();

//     // Refund process if paid online
//     if (order.paymentStatus === "Paid") {
//       order.paymentStatus = "Refunded";
//       order.refunded = true;
//       // Implement actual refund logic here (bank transfer, GPay, etc.)
//     }

//     res.status(200).json({ message: "Order cancelled successfully", order });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error cancelling order", error: error.message });
//   }
// };

// //track order
// exports.trackOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const order = await Order.findById(orderId);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Example tracker details
//     res.status(200).json({
//       orderId: order._id,
//       currentLocation: order.status === "Shipped" ? "In Transit" : order.status,
//       estimatedDeliveryTime: order.status === "Shipped" ? "2024-11-10" : "N/A",
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error tracking order", error: error.message });
//   }
// };

// // Confirm order delivery
// exports.confirmDelivery = async (req, res) => {
//   try {
//     const orderId = req.params.orderId;

//     // Find the order and update fields related to delivery
//     const order = await Order.findByIdAndUpdate(
//       orderId,
//       {
//         status: "Delivered",
//         paymentStatus: "Paid", // Assuming online payment is completed
//         "tracker.currentLocation": "Customer Location",
//         "tracker.status": "Delivered",
//         cancellationAllowed: false,
//         updatedAt: Date.now(),
//       },
//       { new: true } // Return the updated document
//     );

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     return res.status(200).json({
//       message: "Order delivered",
//       order,
//     });
//   } catch (error) {
//     console.error("Error delivering order:", error); // Log the full error for debugging

//     return res.status(500).json({
//       message: "Server error",
//       error: error.message || "An unexpected error occurred",
//     });
//   }
// };
// // Return order
// exports.returnOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const order = await Order.findById(orderId);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const returnDeadline = new Date(order.returnDeadline);
//     if (Date.now() > returnDeadline) {
//       return res.status(400).json({ message: "Return period expired" });
//     }

//     order.status = "Returned";
//     order.refunded = true;
//     // Implement refund logic (bank transfer/GPay here)
//     order.paymentStatus = "Refunded";

//     await order.save();
//     res
//       .status(200)
//       .json({ message: "Order returned and refund processed", order });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error processing return", error: error.message });
//   }
// };

const Order = require("../models/Order");

// Helper function to calculate estimated cost (items, shipping cost, and tax)
function calculateEstimatedCost(items, shippingCost, taxRate) {
  const itemCost = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = itemCost * taxRate;
  return itemCost + tax + shippingCost;
}

// Place a new order
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

// Get all orders for a user with their statuses
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.status(200).json({ orders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve orders", error: error.message });
  }
};

// Accept an order
exports.acceptOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: "Accepted" },
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

// Track an order
exports.trackOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      orderId: order._id,
      status: order.status,
      currentLocation: order.status === "Shipped" ? "In Transit" : order.status,
      estimatedDeliveryTime: order.status === "Shipped" ? "2024-11-20" : "N/A",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to track order", error: error.message });
  }
};

// Cancel an order
exports.cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (["Shipped", "Delivered"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Cannot cancel order after shipment or delivery" });
    }

    order.status = "Cancelled";
    order.cancellationDate = new Date();
    await order.save();

    if (order.paymentStatus === "Paid") {
      order.paymentStatus = "Refunded";
      // Add refund logic here (payment gateway integration)
    }

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to cancel order", error: error.message });
  }
};

// Confirm delivery of an order
exports.confirmDelivery = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure the order is not already marked as Delivered
    if (order.status === "Delivered") {
      return res
        .status(400)
        .json({ message: "Order is already marked as Delivered" });
    }

    // Update status to Delivered
    order.status = "Delivered";
    order.deliveredAt = new Date();

    // If the payment method is COD, update paymentStatus to Paid
    if (order.paymentMethod === "COD") {
      order.paymentStatus = "Paid";
    }

    await order.save();

    res.status(200).json({
      message: "Order marked as delivered successfully.",
      order,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to confirm delivery", error: error.message });
  }
};

exports.returnOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const returnDeadline = new Date(order.returnDeadline);
    if (Date.now() > returnDeadline) {
      return res.status(400).json({ message: "Return period expired" });
    }

    // Update status to Returned
    order.status = "Returned";

    // Ensure payment status is updated to Refunded
    if (["COD", "Online"].includes(order.paymentMethod)) {
      order.paymentStatus = "Refunded";
      order.refundInitiatedAt = new Date();
      order.refunded = true;

      // Add optional payment gateway refund logic here
      // e.g., await paymentGateway.refund(order.totalAmount);
    }

    await order.save();

    res.status(200).json({
      message:
        "Order returned successfully and payment status updated to Refunded.",
      order,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to process return", error: error.message });
  }
};
