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
