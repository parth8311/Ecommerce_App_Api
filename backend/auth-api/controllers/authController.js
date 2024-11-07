const User = require("../models/authModel");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const { generateToken } = require("../utils/tokenService");

// Register User
exports.register = async (req, res) => {
  const { name, email, password, mobileNumber } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = generateToken(user._id);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
