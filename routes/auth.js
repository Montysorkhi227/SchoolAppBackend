const express = require('express');
const router = express.Router();
const User = require('../models/user');
const PendingRequest = require('../models/pendingRequest');

// ✅ Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password, contact, role, profileImage, wards } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists.' });

    const newUser = new User({
      name,
      email,
      password,
      contact,
      role,
      profileImage,
      wards: role === 'Parent' ? wards : [],
      isApproved: role === 'Teacher' || role === 'Accountant' ? false : true,
    });

    await newUser.save();
    res.status(201).json({
      message:
        role === 'Teacher' || role === 'Accountant'
          ? 'Request pending approval.'
          : 'Signup successful.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

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
      name: new RegExp(`^${username}$`, 'i'),
      password,
      role,
    });

    if (!user) {
      const isPending = await PendingRequest.findOne({
        name: new RegExp(`^${username}$`, 'i'),
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
        message: 'Invalid name, password, or role.',
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
