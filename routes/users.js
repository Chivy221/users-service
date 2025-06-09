const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    console.log(`🟡 GET /users -> Found ${users.length} users`);
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST new user
const { v4: uuidv4 } = require("uuid");

router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    const newUser = new User({
      name,
      email,
      id: uuidv4(),
    });
    const savedUser = await newUser.save();
    console.log("✅ User saved:", savedUser);
    res.status(201).json(savedUser);
  } catch (err) {
    console.error("❌ Failed to save user:", err.message);
    res.status(500).json({ error: "Failed to save user", details: err.message });
  }
});

module.exports = router;
