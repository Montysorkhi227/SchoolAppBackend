// controllers/authController.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Otp } = require('../models/otp');

// Nodemailer transporter सेटअप करें
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

// OTP जनरेट करने का फ़ंक्शन
exports.generateOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // 6-अंकों वाला OTP जनरेट करें
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiration = Date.now() + 5 * 60 * 1000; // 5 मिनट के लिए वैध

    // OTP को डेटाबेस में सेव करें
    const newOtp = new Otp({ email, otp, expiration });
    await newOtp.save();

    // OTP को ईमेल के माध्यम से भेजें
    const mailOptions = {
      from: user,
      to: email,
      subject: 'Your OTP for Signup',
      text: `Your OTP for signup is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
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

// OTP वेरीफाई करने का फ़ंक्शन
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // OTP को डेटाबेस से ढूंढें
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'No OTP found for this email.' });
    }

    // OTP की एक्सपायरी चेक करें
    if (Date.now() > otpRecord.expiration) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    // OTP मैच करें
    if (otp !== otpRecord.otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // OTP वैलिड है, उपयोगकर्ता को वेरीफाई करें
    res.status(200).json({ message: 'OTP verified successfully.' });

    // उपयोगकर्ता को वेरीफाई करने की प्रक्रिया यहाँ करें

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
