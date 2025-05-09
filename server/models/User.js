const mongoose = require('mongoose');
const Note = require('./Note');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordCode: String,
  resetPasswordExpires: Date,
  notes: [Note.schema]

});

module.exports = mongoose.model('User', userSchema);
