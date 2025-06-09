const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const UserSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, required: true }, 
  name: String,
  email: String,
});

module.exports = mongoose.model("User", UserSchema);
