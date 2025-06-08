const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { encrypt, decrypt } = require('../crypto');
const cache = require('../cache');

router.post('/', async (req, res) => {
  try {
    const user = new User({
      name: encrypt(req.body.name),
      email: encrypt(req.body.email)
    });
    await user.save();
    res.status(201).json({ id: user._id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/', async (req, res) => {
  const users = await User.find().lean();
  users.forEach(u => {
    u.name = decrypt(u.name);
    u.email = decrypt(u.email);
  });
  res.json(users);
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  let user = cache.get(id);
  if (user) return res.json(user);

  user = await User.findById(id).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.name = decrypt(user.name);
  user.email = decrypt(user.email);
  cache.set(id, user);
  res.json(user);
});

module.exports = router;
