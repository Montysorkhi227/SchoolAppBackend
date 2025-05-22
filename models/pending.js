const mongoose = require('mongoose');

const pendingRequestSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true },
  password: { type: String, required: true },
  contact:  { type: String, required: true },
  role:     { type: String, enum: ['Parent', 'Teacher', 'Accountant'], required: true },
  profileImage: { type: String },
  wards:    { type: [String], default: [] },
  isApproved:   { type: Boolean, default: false },
});

module.exports = mongoose.model('PendingRequest', pendingRequestSchema);
