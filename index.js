require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const NodeCache = require('node-cache');
const User = require('./models/User');
const { log } = require('./utils/logger');
const { increment, getMetrics } = require('./utils/metrics');
const { connectMQ, sendToQueue, onMessage } = require('./services/mq');

const app = express();
const cache = new NodeCache({ stdTTL: 60 });

app.use(express.json());

// Health & Metrics
app.get('/ping', (_, res) => res.send('pong'));
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok', service: 'users-service' });
});
app.get('/metrics', (_, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(getMetrics());
});

// GET all users (no decryption)
app.get('/users', async (req, res) => {
  increment();

  try {
    const cached = cache.get('users');
    if (cached) return res.json(cached);

    const users = await User.find();
    const userList = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email
    }));

    cache.set('users', userList);
    log('GET /users');
    res.json(userList);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST new user
const { v4: uuidv4 } = require('uuid');

app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;

    const newUser = new User({
      name,
      email,
      id: uuidv4()
    });

    const saved = await newUser.save();
    console.log('✅ User saved:', saved);
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Error saving user:', err);
    res.status(500).json({ error: 'Failed to save user', details: err.message });
  }
});

// DELETE user
app.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await User.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).send('User not found');
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// MongoDB + Start
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('✅ MongoDB connected');
  await connectMQ();

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`✅ Users service running on port ${port}`);
  });
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

// In-memory message queue handler (optional)
connectMQ().then(() => {
  onMessage(msg => {
    console.log('📨 Received message from MQ:', msg);
  });
});

module.exports = app;
