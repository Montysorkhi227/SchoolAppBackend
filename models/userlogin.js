// models/userLogin.js
const mongoose = require('mongoose');

const userLoginSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  email: String,
  contact: String,
  role: String,
  profileImage: String,
  wards: [String],
  loginTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserLogin', userLoginSchema);
