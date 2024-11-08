const otpGenerator = require("otp-generator");

exports.generateOTP = () => otpGenerator.generate(6, { digits: true });

exports.sendOTP = async (mobileNumber, otp) => {
  console.log(`OTP for ${mobileNumber}: ${otp}`); // Replace with SMS API integration
  return true;
};
