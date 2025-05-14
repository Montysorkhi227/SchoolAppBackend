const express = require('express');
const router = express.Router();
const multer = require('multer');
const nodemailer = require('nodemailer');
const { storage } = require('../config/Cloudinary');
const upload = multer({ storage });

const { User } = require('../models/user');
const PendingRequest = require('../models/pending');
const crypto = require('crypto'); // To generate OTP

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',  // You can use other services like SendGrid
  auth: {
    user: 'your-email@example.com', // Replace with your email
    pass: 'your-email-password', // Replace with your email password (consider using app passwords)
  },
});

// ✅ Signup Route with OTP
router.post('/signup', upload.single('profileImage'), async (req, res) => {
  const { username, email, password, contact, role } = req.body;
  let wards = [];

  try {
    if (role === 'Parent') {
      wards = JSON.parse(req.body.wards || '[]');
    }

    // Check for existing user/email
    const emailInUsers = await User.findOne({ email });
    const emailInPending = await PendingRequest.findOne({ email });
    if (emailInUsers || emailInPending) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    const userInUsers = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
    const userInPending = await PendingRequest.findOne({ username: new RegExp(`^${username}$`, 'i') });
    
    if (userInUsers || userInPending) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    const profileImage = req.file?.path || '';

    // Generate OTP (6-digit random number)
    const otp = crypto.randomInt(100000, 999999); 
    // Send OTP to email
    const mailOptions = {
      from: EMAIL_USER, // Sender address
      to: email, // Receiver address
      subject: 'Your OTP for Signup',
      text: `Your OTP for signup is: ${otp}`, // OTP in the body of the email
    };

    // Send OTP email
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to send OTP.' });
      }

      // Save OTP and expiration time (optional) in a temporary storage (e.g., database or cache)
      // Here you would typically save the OTP to a database or in-memory cache (like Redis).
      // For now, we'll just send it back in the response.
      const otpExpiration = Date.now() + 5 * 60 * 1000; // 5 minutes expiration time

      // Store OTP temporarily for verification (e.g., store OTP in a session or DB)
      req.session.otp = otp; // Using session for simplicity
      req.session.otpExpiration = otpExpiration;

      // You can save user data to PendingRequest or directly to User if OTP is valid
      const userData = {
        username,
        email,
        password,
        contact,
        role,
        profileImage,
        wards,
        isApproved: role === 'Teacher' || role === 'Accountant' ? false : true,
      };

      // Save to PendingRequest if not yet approved
      if (userData.isApproved === false) {
        const pendingUser = new PendingRequest(userData);
        await pendingUser.save();
        return res.status(201).json({ message: 'Request pending approval. OTP sent to email.' });
      }

      // Otherwise, save to User directly
      const newUser = new User(userData);
      await newUser.save();

      res.status(201).json({ message: 'Signup successful. OTP sent to email.' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

// OTP Verification Route
router.post('/verify-otp', async (req, res) => {
  const { otp } = req.body;

  try {
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required.' });
    }

    // Check if OTP is valid and not expired
    if (req.session.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    const currentTime = Date.now();
    if (currentTime > req.session.otpExpiration) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    // OTP is valid, proceed with finalizing the signup (e.g., save the user)
    res.status(200).json({ message: 'OTP verified successfully. Proceeding with signup.' });
    // Finalize the user creation after OTP verification
    // You can save the user to the `User` collection now that OTP is verified.

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Something went wrong during OTP verification.' });
  }
});

module.exports = router;
