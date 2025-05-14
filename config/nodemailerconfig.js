const nodemailer = require('nodemailer');
require('dotenv').config();

// Create the nodemailer transporter using the environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Ensure your email user is set in .env
    pass: process.env.EMAIL_PASSWORD,  // Ensure your email password is set in .env
  },
});

// Function to send email
const sendMail = async (to, subject, text, html) => {
  try {
    // Setup mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Mail sent successfully to ${to}`);
  } catch (error) {
    console.error('Error in sending email:', error);
  }
};

module.exports = sendMail;
