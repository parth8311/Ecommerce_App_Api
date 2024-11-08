const mongoose = require("mongoose");
const validator = require("validator");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error("Invalid Email");
    },
  },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: 600 } }, // OTP expires in 10 minutes
});

module.exports = mongoose.model("Otp", otpSchema);
