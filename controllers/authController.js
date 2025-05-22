const Otp = require('../models/otp');
const User = require('../models/user');

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find valid OTP
    const otpRecord = await Otp.findOne({
      email,
      otp,
      expiration: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Delete used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    // Update user verification status
    await User.updateOne({ email }, { $set: { isVerified: true } });
console.log("otp sent ")
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
