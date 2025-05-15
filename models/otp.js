//otp.js

const mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiration: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Otp = mongoose.model('Otp', otpSchema);
module.exports = { Otp };
