const User = require("../models/User");

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
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newAddress = { street, city, state, zip, country };
    user.savedAddresses.push(newAddress);
    await user.save();

    res.json({
      message: "Address added successfully",
      savedAddresses: user.savedAddresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order history
exports.getOrderHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ orderHistory: user.orderHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
