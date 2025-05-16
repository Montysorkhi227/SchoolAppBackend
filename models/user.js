//user.js
const mongoose = require('mongoose');
const wardSchema = mongoose.Schema({
  name: String,
  studentClass: String,
  section: String,
});
const userSchema = mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  contact: String,
  role: String,
  profileImage: String,
  wards: [wardSchema],
  isApproved: { type: Boolean, default: false },
  otp: String,
  isVerified: { type: Boolean, default: false },
  otpExpiresAt: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = { User };
