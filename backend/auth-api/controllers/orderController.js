const Order = require("../models/Order");

// Fetch order history
exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate(
      "items.productId"
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Checkout process
exports.checkout = async (req, res) => {
  const { items, address, paymentMethod } = req.body;
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  try {
    const newOrder = new Order({
      user: req.user.id,
      items,
      totalAmount,
      address,
      paymentMethod,
      status: "Pending",
    });

    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
