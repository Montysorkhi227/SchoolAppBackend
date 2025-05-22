// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcrypt");
// const dotenv = require("dotenv");
// dotenv.config();
// const multer = require("multer");
// const nodemailer = require("nodemailer");
// const crypto = require("crypto");
// const { storage } = require("../config/Cloudinary");
// const upload = multer({ storage });

// const { User } = require("../models/user");
// const PendingRequest = require("../models/pending");
// const Otp = require("../models/otp");
// const { verifyOtp } = require("../controllers/authController");

// // ✅ Configure Nodemailer with Environment Variables
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// // ✅ Signup Route with OTP

// router.post("/signup", upload.single("profileImage"), async (req, res) => {
//   const { username, email, password, contact, role } = req.body;
//   let wards = [];

//   try {
//     // Parse wards data if role is Parent
//     if (role === "Parent") {
//       wards = JSON.parse(req.body.wards || "[]");
//     }

//     // Check if email already exists in Users or Pending Requests
//     const emailInUsers = await User.findOne({ email });
//     const emailInPending = await PendingRequest.findOne({ email });
//     if (emailInUsers || emailInPending) {
//       return res.status(400).json({ message: "Email already exists." });
//     }

//     // Check if username already exists in Users or Pending Requests
//     const userInUsers = await User.findOne({
//       username: new RegExp(`^${username}$`, "i"),
//     });
//     const userInPending = await PendingRequest.findOne({
//       username: new RegExp(`^${username}$`, "i"),
//     });

//     if (userInUsers || userInPending) {
//       return res.status(400).json({ message: "Username already exists." });
//     }

//     // Get profile image URL from Cloudinary upload
//     const profileImage = req.file?.path || "";

//     // Hash the password before saving
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Generate OTP
//     const otp = crypto.randomInt(100000, 999999).toString();
//     const otpExpiration = Date.now() + 5 * 60 * 1000;

//     // Prepare OTP document but DO NOT save yet
//     const newOtp = new Otp({
//       email,
//       otp,
//       expiration: new Date(otpExpiration),
//     });
    
//     // Send OTP email
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Your OTP for Signup",
//       text: `Your OTP for signup is: ${otp}`,
//     };

//     transporter.sendMail(mailOptions, async (error, info) => {
//       if (error) {
//         return res.status(500).json({ message: 'Failed to send OTP' });
//       }
    
//       await newOtp.save(); // ✅ Save only after email is sent
//       return res.status(200).json({ message: 'OTP sent successfully' });
//     });
    

//       // User data to be saved (with hashed password)
//       const userData = {
//         username,
//         email,
//         password: hashedPassword,  // hashed password here
//         contact,
//         role,
//         profileImage,
//         wards,
//         isApproved: role === "Teacher" || role === "Accountant" ? false : true,
//       };

//       if (!userData.isApproved) {
//         const pendingUser = new PendingRequest(userData);
//         await pendingUser.save();
//         return res
//           .status(201)
//           .json({ message: "Request pending approval. OTP sent to email." });
//       }

//       const newUser = new User(userData);
//       await newUser.save();
//       res
//         .status(201)
//         .json({ message: "Signup successful. OTP sent to email." });
    
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({ message: "Something went wrong.", error });
//   }
// });



// // ✅ OTP Verification Route
// router.post("/verify-otp", verifyOtp);

// router.post("/login", async (req, res) => {
//   const { email, password, role } = req.body;

//   try {
//     // Find the user by username
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(401).json({ message: "User Not Found" });
//     }

//     // Check if the role matches
//     if (user.role !== role) {
//       return res.status(403).json({ message: "Role Not Matched" });
//     }

//     // Compare the entered password with the hashed password using bcrypt
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({ message: "Wrong password" });
//     }

//     // Successful login
//     res.status(200).json({ message: "Login Success", user });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// });
// router.post('/admin/accepted-request', async (req, res) => {
//   const { id } = req.body;
//   const pending = await PendingRequest.findById(id);
//   if (!pending) return res.status(404).json({ message: 'Not found' });

//   const newUser = new User({
//     username: pending.username,
//     email: pending.email,
//     password: pending.password,
//     contact: pending.contact,
//     role: pending.role,
//     profileImage: pending.profileImage,
//     wards: pending.wards,
//     isApproved: true,
//   });

//   await newUser.save();
//   await PendingRequest.findByIdAndDelete(id);
//   res.status(200).json({ message: 'User approved' });
// });

// router.post('/admin/declined-request', async (req, res) => {
//   const { id } = req.body;
//   await PendingRequest.findByIdAndDelete(id);
//   res.status(200).json({ message: 'Request declined' });
// });


// module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();
const UserLogin = require('../models/userlogin');

const multer = require('multer');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { promisify } = require('util');

const { storage } = require('../config/Cloudinary');
const upload = multer({ storage });

const User = require('../models/user');
const PendingRequest = require('../models/pending');
const Otp = require('../models/otp');
const { verifyOtp } = require('../controllers/authController');
const { log } = require('console');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
const sendMail = promisify(transporter.sendMail).bind(transporter);

// Signup Route with OTP
router.post('/signup', upload.single('profileImage'), async (req, res) => {
  const { username, email, password, contact, role } = req.body;
  let wards = [];

  try {
    // Validate required fields
    if (!username || !email || !password || !contact || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Parse wards if Parent
    if (role === 'Parent') {
      try {
        wards = JSON.parse(req.body.wards || '[]');
      } catch (e) {
        return res.status(400).json({ message: 'Invalid wards format' });
      }
    }

    // Check existing users
    const emailExists = await User.findOne({ email }) || await PendingRequest.findOne({ email });
    if (emailExists) return res.status(400).json({ message: 'Email already exists.' });

    const usernameExists = await User.findOne({ username: new RegExp(`^${username}$`, 'i') }) ||
                           await PendingRequest.findOne({ username: new RegExp(`^${username}$`, 'i') });
    if (usernameExists) return res.status(400).json({ message: 'Username already exists.' });

    // Process profile image
    const profileImage = req.file?.path || '';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP first
    await new Otp({ 
      email, 
      otp, 
      expiration: otpExpiration 
    }).save();

    // Send email
    await sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Signup',
      text: `Your OTP for signup is: ${otp}`,
    });

    // Prepare user data
    const userData = {
      username,
      email,
      password: hashedPassword,
      contact,
      role,
      profileImage,
      wards,
      isApproved: !['Teacher', 'Accountant'].includes(role),
    };

    // Handle approval workflow
    if (userData.isApproved) {
      const newUser = await User.create(userData);
      return res.status(201).json({ 
        message: 'Signup successful. OTP sent to email.',
        userId: newUser._id 
      });
    }

    const pendingUser = await PendingRequest.create(userData);
    res.status(201).json({ 
      message: 'Request pending approval. OTP sent to email.',
      userId: pendingUser._id 
    });
    console.log("Account Created")

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// OTP Verification
router.post('/verify-otp', verifyOtp);

// Login 
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) 
      return res.status(401).json({ message: 'User not found' });

    // 2. Check role
    if (user.role !== role) 
      return res.status(403).json({ message: 'Role mismatch' });

    // 3. Ensure account is approved and verified
    if (!user.isApproved) 
      return res.status(403).json({ message: 'Account pending approval.' });
    if (!user.isVerified) 
      return res.status(403).json({ message: 'Email not verified.' });

    // 4. Check if user is already logged in
    if (user.isLoggedIn) 
      return res.status(403).json({ message: 'User already logged in from another device.' });

    // 5. Validate password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) 
      return res.status(401).json({ message: 'Invalid password' });

    // 6. Update login status
    user.isLoggedIn = true;
    await user.save();

    // 7. Record the login
    const loginRecord = await UserLogin.create({
      userId:      user._id,
      username:    user.username,
      email:       user.email,
      contact:     user.contact,
      role:        user.role,
      profileImage:user.profileImage,
      wards:       user.wards,
      isApproved:  user.isApproved,
      isVerified:  user.isVerified
    });

    // 8. Return success + login info
    const { password: _, ...safeUser } = user.toObject();
    res.status(200).json({
      message: 'Login successful',
      user:      safeUser,
      loginId:   loginRecord._id,
      loginAt:   loginRecord.loginAt
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Admin Accepts Request
router.post('/admin/accepted-request', async (req, res) => {
  const { id } = req.body;
  try {
    const pending = await PendingRequest.findById(id);
    if (!pending) return res.status(404).json({ message: 'Not found' });

    const newUser = new User({
      username: pending.username,
      email: pending.email,
      password: pending.password,
      contact: pending.contact,
      role: pending.role,
      profileImage: pending.profileImage,
      wards: pending.wards,
      isApproved: true,
    });

    await newUser.save();
    await PendingRequest.findByIdAndDelete(id);
    res.status(200).json({ message: 'User approved' });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Declines Request
router.post('/admin/declined-request', async (req, res) => {
  const { id } = req.body;
  try {
    await PendingRequest.findByIdAndDelete(id);
    res.status(200).json({ message: 'Request declined' });
  } catch (error) {
    console.error('Decline error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
