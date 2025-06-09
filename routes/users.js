const express = require("express");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const { encrypt, decrypt } = require("../utils/encryption");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find().lean(); 
    const decryptedUsers = users.map((user) => ({
      ...user,
      name: decrypt(user.name),
      email: decrypt(user.email),
    }));
    res.json(decryptedUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users", details: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = new User({
      id: uuidv4(),
      name: encrypt(name),
      email: encrypt(email),
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to save user", details: error.message });
  }
});

module.exports = router;
