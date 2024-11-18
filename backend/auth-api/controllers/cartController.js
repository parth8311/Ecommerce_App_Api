const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Add an item to the cart
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Define default tax rate (can be adjusted as per your business rules)
    const taxRate = 0.1; // 10% tax

    // Calculate the price with tax
    const productPriceWithTax = product.price * quantity * (1 + taxRate);

    if (!cart) {
      cart = new Cart({
        userId,
        items: [
          {
            productId,
            quantity,
            category: product.category, // Add product category
            image: product.image, // Add product image
            taxAmount: product.price * quantity * taxRate, // Calculate tax
            priceWithTax: productPriceWithTax, // Price including tax
          },
        ],
        totalPrice: productPriceWithTax,
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (itemIndex > -1) {
        // Update quantity, tax and price including tax
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].taxAmount =
          product.price * cart.items[itemIndex].quantity * taxRate;
        cart.items[itemIndex].priceWithTax =
          product.price * cart.items[itemIndex].quantity * (1 + taxRate);
      } else {
        // Add new item
        cart.items.push({
          productId,
          quantity,
          category: product.category, // Add product category
          image: product.image, // Add product image
          taxAmount: product.price * quantity * taxRate, // Calculate tax
          priceWithTax: productPriceWithTax, // Price including tax
        });
      }
      // Update total price with tax
      cart.totalPrice += productPriceWithTax;
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
      // Recalculate price with tax
      const productPriceWithTax = product.price * quantity * (1 + 0.1); // Assuming 10% tax
      cart.totalPrice +=
        productPriceWithTax - cart.items[itemIndex].priceWithTax;

      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].priceWithTax = productPriceWithTax;
      cart.items[itemIndex].taxAmount = product.price * quantity * 0.1; // Tax calculation

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
      // Update total price
      cart.totalPrice -= cart.items[itemIndex].priceWithTax;
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
