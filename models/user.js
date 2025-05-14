const mongoose = require('mongoose');

const wardSchema = mongoose.Schema({
  name: String,
  studentClass: String,
  section: String,
});

const userSchema = mongoose.Schema({
  username: { type: String, unique: true }, // Replaced 'name' with 'username' and made it unique
  email: { type: String, unique: true },
  password: String,
  contact: String,
  role: String,
  profileImage: String,
  wards: [wardSchema],
  isApproved: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);
module.exports = { User };
