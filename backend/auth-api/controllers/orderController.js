const Order = require("../models/Order");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const validatePayment = require("../utils/validatePayment");

function calculateEstimatedCost(items, shippingCost, taxRate) {
  const itemCost = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = itemCost * taxRate;
  return itemCost + tax + shippingCost;
}

function calculateShippingCost(distance) {
  return distance >= 5 && distance <= 50 ? 0 : 10;
}

exports.placeOrder = async (req, res) => {
  const {
    items,
    totalAmount,
    address,
    paymentMethod,
    paymentDetails,
    distance, // Distance in km passed from the request body
    taxRate = 0.1,
  } = req.body;

  try {
    // Validate payment details
    const errors = validatePayment(paymentMethod, paymentDetails);
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ message: "Invalid payment details", errors });
    }

    const shippingCost = calculateShippingCost(distance);
    const estimatedCost = calculateEstimatedCost(items, shippingCost, taxRate);

    // Fetch user email from req.user (assuming auth middleware adds it)
    const userEmail = req.user.email;

    const newOrder = new Order({
      user: req.user.id,
      items,
      totalAmount,
      estimatedCost,
      address,
      paymentMethod,
      paymentDetails,
      shippingCost,
      tax: estimatedCost * taxRate,
      distance,
    });

    const order = await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to place order", error: error.message });
  }
};

// Validate Payment Helper
exports.validatePayment = (details) => {
  const { cardNumber, expiryDate, cvv, pin, type } = details;

  if (type === "Credit Card" || type === "Debit Card") {
    // Simple validation for card details
    const cardNumberRegex = /^[0-9]{16}$/; // 16-digit card number
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/; // Format MM/YY
    const cvvRegex = /^[0-9]{3}$/;

    if (
      !cardNumberRegex.test(cardNumber) ||
      !expiryDateRegex.test(expiryDate) ||
      !cvvRegex.test(cvv)
    ) {
      return false;
    }
  }

  if (type === "UPI") {
    const upiRegex = /^[\w.-]+@[\w]+$/; // UPI ID format
    if (!upiRegex.test(details.upiId)) {
      return false;
    }
  }

  return true;
};

// Additional payment methods for PayPal, Paytm, GPay
exports.processPayment = async (method, details) => {
  try {
    if (method === "PayPal") {
      // Call PayPal API for payment processing
      const response = await processPayPalPayment(details);
      return response;
    } else if (method === "Paytm") {
      // Call Paytm API for payment processing
      const response = await processPaytmPayment(details);
      return response;
    } else if (method === "GPay") {
      // Call Google Pay API for payment processing
      const response = await processGPayPayment(details);
      return response;
    }
    return { success: false, message: "Unsupported payment method" };
  } catch (error) {
    throw new Error("Payment processing failed: " + error.message);
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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dalsaniyaforam0205@gmail.com", // Your email address
    pass: "czmoguppqerllccj", // Your email password
  },
});

async function sendInvoiceEmail(userEmail, invoicePath) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: "Your Order Invoice",
    text: "Thank you for your order! Please find your invoice attached.",
    attachments: [{ filename: "invoice.pdf", path: invoicePath }],
  };

  await transporter.sendMail(mailOptions);
}

function generateInvoicePDF(order) {
  const doc = new PDFDocument();
  const invoicePath = path.join(
    __dirname,
    `../invoices/invoice_${order._id}.pdf`
  );

  doc.pipe(fs.createWriteStream(invoicePath));

  // Add content to the PDF
  doc.fontSize(20).text("Invoice", { align: "center" });
  doc.fontSize(12).text(`\nOrder ID: ${order._id}`);
  doc.text(`\nDate: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`\nShipping Address: ${order.address}`);
  doc.text(`\nStatus: ${order.status}`);
  doc.text(`\nTotal Amount: ${order.totalAmount.toFixed(2)}`); // Updated to display  symbol
  doc.text("\nItems Purchased:");

  // Loop through items and list them
  order.items.forEach((item) => {
    doc.text(
      `- ${item.name} x${item.quantity} = ${(
        item.price * item.quantity
      ).toFixed(2)}`
    ); // Item cost with  symbol
  });

  // Add estimated total cost, tax, and shipping
  doc.text(`\nEstimated Total Cost: ${order.estimatedCost.toFixed(2)}`); // Updated to display  symbol
  doc.text(`\nTax: ${order.tax.toFixed(2)}`); // If tax is part of the order object
  doc.text(`\nShipping Cost: ${order.shippingCost.toFixed(2)}`); // If shippingCost is part of the order object

  doc.end();

  return invoicePath;
}

exports.confirmDelivery = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId).populate("user", "email");

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

    // Update payment status based on the payment method
    if (
      ["Credit Card", "Debit Card", "PayPal", "Paytm", "GPay", "UPI"].includes(
        order.paymentMethod
      )
    ) {
      order.paymentStatus = "Paid"; // Update to Paid for online methods
    } else if (order.paymentMethod === "COD") {
      order.paymentStatus = "Paid"; // For COD, update as Paid after delivery
    }

    await order.save();

    // Generate invoice PDF
    const invoiceFilePath = generateInvoicePDF(order);

    // Send invoice email to user
    await sendInvoiceEmail(order.user.email, invoiceFilePath);

    res.status(200).json({
      message: "Order marked as delivered and invoice sent successfully.",
      order,
    });
  } catch (error) {
    console.error("Error confirming delivery:", error); // Log the full error for debugging

    return res.status(500).json({
      message: "Failed to confirm delivery",
      error: error.message || "An unexpected error occurred",
    });
  }
};

exports.returnOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the return period has expired
    const returnDeadline = new Date(order.returnDeadline);
    if (Date.now() > returnDeadline) {
      return res.status(400).json({ message: "Return period expired" });
    }

    // Ensure the order is eligible for return
    if (!["Delivered"].includes(order.status)) {
      return res.status(400).json({
        message: "Only delivered orders can be returned.",
      });
    }

    // Update order status to Returned
    order.status = "Returned";

    // Update payment status to Refunded
    order.paymentStatus = "Refunded";
    order.refundInitiatedAt = new Date();
    order.refunded = true;

    // Optional: Add payment gateway integration for refund processing here
    // Example: await paymentGateway.refund(order.totalAmount);

    await order.save();

    res.status(200).json({
      message: "Order returned successfully and payment refunded.",
      order,
    });
  } catch (error) {
    console.error("Error processing return:", error); // Log for debugging
    res
      .status(500)
      .json({ message: "Failed to process return", error: error.message });
  }
};
