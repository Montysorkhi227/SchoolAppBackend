// controllers/authController.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const  Otp  = require('../models/otp');
const { log } = require('console');

// ✅ Ensure environment variables are loaded
require('dotenv').config();

// ✅ Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
// ✅ Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  console.log(otp)
  try {
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'No OTP found for this email.' });
    }

    if (Date.now() > otpRecord.expiration) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    if (otp !== otpRecord.otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    await Otp.deleteMany({ email }); // Clean up old OTPs after verification

    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};