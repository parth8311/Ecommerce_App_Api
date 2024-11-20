module.exports = function validatePayment(paymentMethod, paymentDetails) {
  const errors = [];

  if (!paymentMethod) {
    errors.push("Payment method is required.");
  }

  switch (paymentMethod) {
    case "Credit Card":
    case "Debit Card":
      if (
        !paymentDetails?.cardNumber ||
        !/^\d{16}$/.test(paymentDetails.cardNumber)
      ) {
        errors.push("Invalid card number. It should be 16 digits.");
      }
      if (
        !paymentDetails?.expiryDate ||
        !/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentDetails.expiryDate)
      ) {
        errors.push("Invalid expiry date. Format should be MM/YY.");
      }
      if (!paymentDetails?.cvv || !/^\d{3}$/.test(paymentDetails.cvv)) {
        errors.push("Invalid CVV. It should be 3 digits.");
      }
      break;

    case "UPI":
      if (
        !paymentDetails?.upiId ||
        !/^[\w.-]+@[\w.-]+$/.test(paymentDetails.upiId)
      ) {
        errors.push("Invalid UPI ID.");
      }
      break;

    case "PayPal":
      if (
        !paymentDetails?.email ||
        !/^\S+@\S+\.\S+$/.test(paymentDetails.email)
      ) {
        errors.push("Invalid PayPal email address.");
      }
      break;

    case "Paytm":
      if (
        !paymentDetails?.phoneNumber ||
        !/^\d{10}$/.test(paymentDetails.phoneNumber)
      ) {
        errors.push("Invalid phone number. It should be 10 digits.");
      }
      break;

    case "COD":
      // No validation needed for Cash on Delivery
      break;

    default:
      errors.push("Unsupported payment method.");
  }

  return errors;
};
