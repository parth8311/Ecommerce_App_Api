const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Add an item to the cart
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, quantity }],
        totalPrice: product.price * quantity,
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      cart.totalPrice += product.price * quantity;
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get the user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate(
      "items.productId"
    );
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an item quantity in the cart
exports.updateCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      const product = await Product.findById(productId);
      cart.totalPrice +=
        (quantity - cart.items[itemIndex].quantity) * product.price;
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: "Product not in cart" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove an item from the cart
exports.removeCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      const product = await Product.findById(productId);
      cart.totalPrice -= cart.items[itemIndex].quantity * product.price;
      cart.items.splice(itemIndex, 1);
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: "Product not in cart" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Clear the cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndDelete({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
