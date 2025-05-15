const express = require('express');
const router = express.Router();
const multer = require('multer');
const nodemailer = require('nodemailer');
const { storage } = require('../config/Cloudinary');
const upload = multer({ storage });

const { User } = require('../models/user');
const PendingRequest = require('../models/pending');
const Otp = require('../models/otp'); // Import the OTP model
const crypto = require('crypto'); // To generate OTP

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',  // You can use other services like SendGrid
  auth: {
    user: 'montysorkhi227@gmail.com', // Replace with your email
    pass: 'ecna ozkd rttd lihe', // Replace with your email password (consider using app passwords)
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
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiration = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes

    // Save OTP to the database
    const newOtp = new Otp({
      email,
      otp,
      expiration: new Date(otpExpiration),
    });

    await newOtp.save();

    // Send OTP to email
    const mailOptions = {
      from: 'your-email@example.com', // Sender address
      to: email, // Receiver address
      subject: 'Your OTP for Signup',
      text: `Your OTP for signup is: ${otp}`, // OTP in the body of the email
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to send OTP.' });
      }

      // Prepare user data (pending approval)
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

// OTP Verification 
Routerouter.post('/generate-otp', generateOtp);

// OTP वेरीफाई करने के लिए रूट
router.post('/verify-otp', verifyOtp);