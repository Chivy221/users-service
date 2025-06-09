require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const NodeCache = require('node-cache');
const User = require('./models/User');
const { encrypt, decrypt } = require('./services/encryption');
const { log } = require('./utils/logger');
const { increment, getMetrics } = require('./utils/metrics');
const { connectMQ, sendToQueue, onMessage } = require('./services/mq');

const app = express();
const cache = new NodeCache({ stdTTL: 60 });

app.use(express.json());

app.get('/ping', (_, res) => res.send('pong'));
app.get('/health', (req, res) => {
res.status(200).json({ status: 'ok', service: 'users-service' });
});

app.delete('/users/:id', async (req, res) => {
try {
const deleted = await User.findByIdAndDelete(req.params.id);
if (!deleted) return res.status(404).send('Not found');
res.sendStatus(204);
} catch (e) {
res.status(500).send('Server error');
}
});
app.get('/metrics', (_, res) => {
res.set('Content-Type', 'text/plain');
res.send(getMetrics());
});

app.get('/users', async (req, res) => {
increment();
const cached = cache.get('users');
if (cached) return res.json(cached);

const users = await User.find();
const decryptedUsers = users.map(u => ({
id: u._id,
name: u.name,
email: decrypt(u.email)
}));
cache.set('users', decryptedUsers);
log('GET /users');
res.json(decryptedUsers);
});

app.post('/users', async (req, res) => {
  try {
    const user = new User(req.body); // id сгенерируется автоматически
    const saved = await user.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error saving user:", err);
    res.status(500).json({ error: 'Failed to save user', details: err.message });
  }
});


mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('✅ MongoDB connected');
  await connectMQ();
  app.listen(process.env.PORT || 3000, () =>
    console.log(`Users service running on port ${process.env.PORT || 3000}`) // обернули в стрелочную функцию с телом
  );
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

connectMQ().then(() => {
  onMessage(msg => {
    console.log('Получено сообщение из in-memory queue:', msg);
    // здесь можно обрабатывать события так же, как раньше
  });
});

module.exports = app;
