const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  registerUsername: String,
  mobile: String,
  email: String,
  registerPassword: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
