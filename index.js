require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const NodeCache = require('node-cache');
const User = require('./models/User');
const { encrypt, decrypt } = require('./services/encryption');
const { log } = require('./utils/logger');
const { increment, getMetrics } = require('./utils/metrics');
const { connectMQ, sendToQueue } = require('./services/mq');

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
increment();
const { name, email } = req.body;
const encryptedEmail = encrypt(email);
const newUser = new User({ name, email: encryptedEmail });
await newUser.save();

const payload = { id: newUser._id, name, email };
sendToQueue({ event: 'user.created', data: payload });

log(POST /users: ${name});
res.status(201).json({ id: newUser._id, name, email });
});

mongoose.connect(process.env.MONGO_URL, {
useNewUrlParser: true,
useUnifiedTopology: true
}).then(async () => {
console.log('✅ MongoDB connected');
await connectMQ();
app.listen(process.env.PORT || 3000, () =>
console.log(🚀 Users service running on port ${process.env.PORT || 3000})
);
}).catch(err => {
console.error('❌ MongoDB connection error:', err.message);
});

module.exports = app;
