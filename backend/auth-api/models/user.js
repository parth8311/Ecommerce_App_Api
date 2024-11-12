const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  fname: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error("Invalid Email");
    },
  },
  password: { type: String, required: true, minlength: 6 },
  tokens: [{ token: { type: String, required: true } }],
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.generateAuthToken = async function () {
  const generateToken = (userId) => {
    return jwt.sign({ _id: userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  };
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

module.exports = mongoose.model("User", userSchema);
