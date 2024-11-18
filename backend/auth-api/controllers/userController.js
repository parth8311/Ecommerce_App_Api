const User = require("../models/userAccount");

// Get user account information
exports.getUserAccountInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new address
exports.addAddress = async (req, res) => {
  const { street, city, state, zip, country } = req.body;

  if (!street || !city || !state || !zip || !country) {
    return res.status(400).json({ message: "All address fields are required" });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if savedAddresses is undefined or null, if so initialize it as an empty array
    if (!user.savedAddresses) {
      user.savedAddresses = [];
    }

    const newAddress = { street, city, state, zip, country };
    user.savedAddresses.push(newAddress);

    await user.save();

    res.json({
      message: "Address added successfully",
      savedAddresses: user.savedAddresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

// Get user order history
exports.getOrderHistory = async (req, res) => {
  try {
    // Fetch the user's order history and populate order details
    const user = await User.findById(req.user.id).populate({
      path: "orderHistory.orderId",
      select: "status totalAmount items createdAt address paymentMethod",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the populated order history
    res.json({ orderHistory: user.orderHistory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching order history" });
  }
};

// Update order status (e.g., "Received", "Returned", etc.)
exports.updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body; // Status could be: 'Received', 'Returned', 'Cancelled'

  if (!orderId || !status) {
    return res
      .status(400)
      .json({ message: "Order ID and status are required" });
  }

  try {
    // Validate status
    const validStatuses = ["Received", "Returned", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order's status and the 'updatedAt' field
    order.status = status;
    order.updatedAt = Date.now();

    await order.save();

    // Update the user's orderHistory array
    const user = await User.findById(order.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the order in user's orderHistory and update it
    const orderHistoryIndex = user.orderHistory.findIndex(
      (entry) => entry.orderId.toString() === orderId.toString()
    );
    if (orderHistoryIndex !== -1) {
      user.orderHistory[orderHistoryIndex].status = status;
      user.orderHistory[orderHistoryIndex].paymentMethod = order.paymentMethod; // Add payment method to history if needed
      await user.save();
    }

    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating order status" });
  }
};
