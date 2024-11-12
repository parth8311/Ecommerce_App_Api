const User = require("../models/user");
const Otp = require("../models/userOTP");

const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mail transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// Register User and Send OTP
exports.registerUser = async (req, res) => {
  const { fname, email, password } = req.body;

  if (!fname || !email || !password)
    return res.status(400).json({ error: "Please fill all fields" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const newUser = new User({ fname, email, password });
    await newUser.save();

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpEntry = await Otp.findOneAndUpdate(
      { email },
      { otp },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "OTP for Registration",
      text: `Your OTP is ${otp}`,
    });

    res
      .status(200)
      .json({ message: "Registration successful, OTP sent to email" });
  } catch (error) {
    res.status(400).json({ error: "Error in registration", error });
  }
};

// Verify OTP and Complete Registration
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpDoc = await Otp.findOne({ email, otp });
    if (!otpDoc)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    await Otp.deleteOne({ email });
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(400).json({ error: "OTP verification failed", error });
  }
};

// Adjusting token generation to expire after one week (7 days)
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Please Enter Both Email and Password",
    });
  }

  try {
    const preuser = await User.findOne({ email });

    if (!preuser) {
      return res.status(400).json({ error: "User not found with this email" });
    }

    const isMatch = await bcrypt.compare(password, preuser.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Generate JWT token with 1 week expiration
    const token = jwt.sign(
      { _id: preuser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Set token to expire after 7 days
    );

    res.status(200).json({
      message: "User Login Successfully",
      userToken: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true, new: true });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}`,
    });

    res.status(200).json({ message: "OTP sent to registered email" });
  } catch (error) {
    res.status(400).json({ error: "Error in sending OTP", error });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const otpDoc = await Otp.findOne({ email, otp });
    if (!otpDoc)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.updateOne({ email }, { password: hashedPassword });
    await Otp.deleteOne({ email });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ error: "Password reset failed", error });
  }
};

// Logout User
// Logout User
exports.logoutUser = async (req, res) => {
  try {
    // `req.user` should be set by the auth middleware after token verification
    req.user.tokens = req.user.tokens.filter(
      (storedToken) => storedToken.token !== req.token
    );

    await req.user.save(); // Save the updated tokens array
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: "Error logging out" });
  }
};
