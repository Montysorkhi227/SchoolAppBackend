const express = require('express');
const router = express.Router();
const User = require('../models/user');

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

module.exports = router;
