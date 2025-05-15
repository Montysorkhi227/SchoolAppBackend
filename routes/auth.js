const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const multer = require('multer');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { storage } = require('../config/Cloudinary');
const upload = multer({ storage });

const { User } = require('../models/user');
const PendingRequest = require('../models/pending');
const Otp = require('../models/otp')
const { verifyOtp } = require('../controllers/authController');

// ✅ Configure Nodemailer with Environment Variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ✅ Signup Route with OTP
router.post('/signup', upload.single('profileImage'), async (req, res) => {
  const { username, email, password, contact, role } = req.body;
  let wards = [];

  try {
    // Parse wards data if role is Parent
    if (role === 'Parent') {
      wards = JSON.parse(req.body.wards || '[]');
    }

    // Check if email already exists in Users or Pending Requests
    const emailInUsers = await User.findOne({ email });
    const emailInPending = await PendingRequest.findOne({ email });
    if (emailInUsers || emailInPending) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    // Check if username already exists in Users or Pending Requests
    const userInUsers = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
    const userInPending = await PendingRequest.findOne({ username: new RegExp(`^${username}$`, 'i') });

    if (userInUsers || userInPending) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // Get profile image URL from Cloudinary upload
    const profileImage = req.file?.path || '';

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiration = Date.now() + 5 * 60 * 1000;

    const newOtp = new Otp({
      email,
      otp,
      expiration: new Date(otpExpiration),
    });

    await newOtp.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Signup',
      text:`Your OTP for signup is: ${otp}`,
    };

    transporter.sendMail(mailOptions, async (error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to send OTP.' });
      }

      // User data to be saved
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

      if (!userData.isApproved) {
        const pendingUser = new PendingRequest(userData);
        await pendingUser.save();
        return res.status(201).json({ message: 'Request pending approval. OTP sent to email.' });
      }

      const newUser = new User(userData);
      await newUser.save();
      res.status(201).json({ message: 'Signup successful. OTP sent to email.' });
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: 'Something went wrong.' ,error});
  }
});

// ✅ Optional OTP Generation Route
router.post('/generate-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiration = Date.now() + 5 * 60 * 1000;

    await Otp.deleteMany({ email });

    const newOtp = new Otp({ email, otp, expiration: new Date(expiration) });
    await newOtp.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`,
    });

    res.status(200).json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate OTP.' });
  }
});

// ✅ OTP Verification Route
router.post('/verify-otp', verifyOtp);

module.exports = router;