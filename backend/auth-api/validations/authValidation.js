// utils/authValidation.js
const Joi = require("joi");

// User Registration Validation
const validateRegister = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    mobileNumber: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required(),
  });
  return schema.validate(data);
};

// Login Validation
const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  });
  return schema.validate(data);
};

// Forgot Password Validation
const validateForgotPassword = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate(data);
};

// Reset Password Validation
const validateResetPassword = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    resetToken: Joi.string().length(6).required(),
    newPassword: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
};
