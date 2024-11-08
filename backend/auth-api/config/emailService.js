const nodemailer = require("nodemailer");

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your preferred email service
  auth: {
    user: "parth.imscit18@gmail.com", // Your email address
    pass: "qsmdfxwyjhisuifj", // Your email password (consider using environment variables)
  },
});
console.log(transporter.auth.user);

exports.sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: "dalsaniyaforam@gmail.com",
      to: to,
      subject: subject,
      text: text,
    };
    console.log(mailOptions);

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
