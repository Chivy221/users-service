const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).json(user);
});

router.get('/', async (_, res) => {
  const users = await User.find();
  res.json(users);
});

module.exports = router;
