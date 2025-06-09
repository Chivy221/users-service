const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  name: String,
  email: String
});


module.exports = mongoose.model('User', UserSchema);
