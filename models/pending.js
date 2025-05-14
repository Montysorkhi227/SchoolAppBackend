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
});

const PendingRequest = mongoose.model('PendingRequest', pendingRequestSchema);
module.exports = PendingRequest;
