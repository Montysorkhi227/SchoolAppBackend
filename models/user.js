const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const wardSchema = mongoose.Schema({
  name: String,
  studentClass: String,
  section: String,
});

const userSchema = mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String, required: true },
  contact: String,
  role: String,
  profileImage: String,
  wards: [wardSchema],
  isApproved: { type: Boolean, default: false },
  otp: String,
  isVerified: { type: Boolean, default: false },
  otpExpiresAt: Date,
}, { timestamps: true });

// 🔐 पासवर्ड हैश करने के लिए प्री-सेव मिडलवेयर
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔑 पासवर्ड की पुष्टि के लिए इंस्टेंस मेथड
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = { User };
