const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/Cloudinary');
const upload = multer({ storage });

const { User } = require('../models/user');
const PendingRequest = require('../models/pending');

// ✅ Signup Route with Image Upload
// ✅ Signup Route with Image Upload
router.post('/signup', upload.single('profileImage'), async (req, res) => {
  const { username, email, password, contact, role } = req.body;
  let wards = [];

  try {
    if (role === 'Parent') {
      wards = JSON.parse(req.body.wards || '[]');
    }

    // Check for existing user/email
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists.' });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already exists.' });

    const profileImage = req.file?.path || '';

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
      return res.status(201).json({ message: 'Request pending approval.' });
    }

    // Otherwise, save to User directly
    const newUser = new User(userData);
    await newUser.save();

    res.status(201).json({ message: 'Signup successful.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
});


// ✅ Login Route
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  if (role === 'Admin' && username === 'Admin' && password === '125033') {
    return res.json({
      success: true,
      message: 'Admin login successful',
      user: { name: 'Admin', role: 'Admin' },
    });
  }

  try {
    const user = await User.findOne({
      username: new RegExp(`^${username}$`, 'i'),  // Match based on username
      password,
      role,
    });

    if (!user) {
      const isPending = await PendingRequest.findOne({
        username: new RegExp(`^${username}$`, 'i'),  // Match based on username
        password,
        role,
      });

      if (isPending) {
        return res.status(401).json({
          success: false,
          pending: true,
          message: 'Your request is still pending admin approval.',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid username, password, or role.',
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});

module.exports = router;
