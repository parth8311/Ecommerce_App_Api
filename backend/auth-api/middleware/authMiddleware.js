const jwt = require("jsonwebtoken");
// const User = require("../models/user");
const User = require("../models/userAccount");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) throw new Error("User not found");

    req.token = token; // Pass the current token to req.token
    req.user = user; // Pass the user data to req.user
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized. Please authenticate." });
    console.log(error);
  }
};

module.exports = authMiddleware;
