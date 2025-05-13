const mongoose = require('mongoose');

const wardSchema = mongoose.Schema({
  name: String,
  studentClass: String,
  section: String,
});

const userSchema = mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  contact: String,
  role: String,
  profileImage: String,
  wards: [wardSchema],
  isApproved: { type: Boolean, default: false },
});

const userloginSchema = new mongoose.Schema({
  name: String,
  password: String,
  role: String,
  wards: [wardSchema],
});

// Define models
const User = mongoose.model('User', userSchema);
const Userlogin = mongoose.model('Userlogin', userloginSchema);

// Export both
module.exports = {
  User,
  Userlogin
};
