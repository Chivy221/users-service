const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4, // авто-генерация UUID
    required: true,
    unique: true
  },
  name: String,
  email: String
});

module.exports = mongoose.model('User', UserSchema);
