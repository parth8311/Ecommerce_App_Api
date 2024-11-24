
const Order = require("../models/Order");
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
    console.log("Fetching order history for user ID:", req.user.id);

    // Fetch the order history from the Order model
    const orderHistory = await Order.find({ user: req.user.id })
      .select("status totalAmount tax totalAmountWithTax items createdAt address paymentMethod")
      .populate("items.productId", "name price");

    // Map over order history and calculate total amount + tax if not already calculated
    const enrichedOrderHistory = orderHistory.map((order) => {
      const totalAmountWithTax = order.totalAmount + order.tax;
      return {
        ...order.toObject(),
        totalAmountWithTax, // Add the combined total
      };
    });

    res.json({ orderHistory: enrichedOrderHistory });
  } catch (error) {
    console.error("Error fetching user order history:", error);
    res
      .status(500)
      .json({ message: "Error fetching order history", error: error.message });
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

    // Ensure the totalAmountWithTax is calculated correctly if it's not already
    if (order.totalAmount && order.tax) {
      order.totalAmountWithTax = order.totalAmount + order.tax;
    }

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
      user.orderHistory[orderHistoryIndex].totalAmount = order.totalAmount;
      user.orderHistory[orderHistoryIndex].tax = order.tax;
      user.orderHistory[orderHistoryIndex].totalAmountWithTax = order.totalAmountWithTax;
      user.orderHistory[orderHistoryIndex].paymentMethod = order.paymentMethod; // Add payment method to history if needed
      await user.save();
    }

    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating order status" });
  }
};
