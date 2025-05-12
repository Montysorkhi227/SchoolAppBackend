const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  name: String,
  studentClass: String,
  section: String,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  contact: String,
  role: String,
  profileImage: String,
  wards: [wardSchema],
  isApproved: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
