//pending.js
const mongoose = require('mongoose');
const pendingRequestSchema = mongoose.Schema({
  username: String,
  password: String,
  role: String,
  wards: [{
    name: String,
    studentClass: String,
    section: String,
  }],
  profileImage: String,
  isApproved: { type: Boolean, default: false },
});

const PendingRequest = mongoose.model('PendingRequest', pendingRequestSchema);
module.exports = PendingRequest;
