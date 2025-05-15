// controllers/authController.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Otp } = require('../models/otp');

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

// ✅ Generate OTP
exports.generateOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiration = Date.now() + 5 * 60 * 1000;

    // Optional: Remove any existing OTPs before saving a new one
    await Otp.deleteMany({ email });

    const newOtp = new Otp({ email, otp, expiration });
    await newOtp.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Signup',
      text: `Your OTP for signup is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to send OTP.' });
      }
      res.status(200).json({ message: 'OTP sent successfully.' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// ✅ Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 }); // Get the latest OTP

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
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

