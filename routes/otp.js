const express = require('express');
const router = express.Router();
const sendMail = require('../config/nodemailerconfig');

const otpStore = {};

// Route to send OTP
router.post('/send', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { code: otp, expires: Date.now() + 5 * 60 * 1000 }; // expires in 5 minutes

  const subject = 'Your OTP Code';
  const text = `Your OTP code is ${otp}. It will expire in 5 minutes.`;
  const html = `<p>Your OTP code is <b>${otp}</b>. It will expire in 5 minutes.</p>`;

  sendMail(email, subject, text, html);

  return res.json({ success: true, message: 'OTP sent successfully' });
});

// Route to verify OTP
router.post('/verify', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ success: false, message: 'OTP not found or expired' });
  }

  if (record.code === otp && Date.now() < record.expires) {
    delete otpStore[email];
    return res.json({ success: true, message: 'OTP verified' });
  }

  return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
});

module.exports = router;
