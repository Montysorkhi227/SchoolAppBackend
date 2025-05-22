const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact:  { type: String, required: true },
  role:     { type: String, enum: ['Student','Parent', 'Teacher', 'Accountant'], required: true },
  profileImage: { type: String },
  wards:    { type: [String], default: [] },
  isApproved:   { type: Boolean, default: false },
  isVerified:   { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
