const { body, validationResult } = require("express-validator");

const validateCart = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("productId").notEmpty().withMessage("Product ID is required"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = validateCart;
