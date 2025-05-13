const mongoose = require('mongoose');
const pendingSchema = new mongoose.Schema({
    name: String,
    password: String,
    role: String,
  });
  
  module.exports = mongoose.model('PendingRequest', pendingSchema);