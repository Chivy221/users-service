const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const NodeCache = require('node-cache');
const { encrypt, decrypt } = require('./services/encryption');
const { log } = require('./utils/logger');
const { increment, getMetrics } = require('./utils/metrics');
const User = require('./models/User');

dotenv.config();
const app = express();
const cache = new NodeCache({ stdTTL: 60 });

app.use(express.json());

app.use((req, res, next) => {
log(${req.method} ${req.url});
increment();
next();
});

app.get('/ping', (_, res) => {
res.send('pong');
});

app.get('/metrics', (_, res) => {
res.set('Content-Type', 'text/plain');
res.send(getMetrics());
});

app.get('/users', async (req, res) => {
const cached = cache.get('users');
if (cached) {
return res.json(cached);
}

try {
const users = await User.find();
const decryptedUsers = users.map(u => ({
_id: u._id,
name: u.name,
email: decrypt(u.email)
}));
cache.set('users', decryptedUsers);
res.json(decryptedUsers);
} catch (err) {
log(Error fetching users: ${err});
res.status(500).json({ error: 'Failed to fetch users' });
}
});

app.post('/users', async (req, res) => {
const { name, email } = req.body;
try {
const encryptedEmail = encrypt(email);
const user = new User({ name, email: encryptedEmail });
await user.save();
cache.del('users'); // очистить кэш
res.status(201).json({ _id: user._id, name: user.name, email });
} catch (err) {
log(Error creating user: ${err});
res.status(500).json({ error: 'Failed to create user' });
}
});

mongoose.connect(process.env.MONGO_URL, {
useNewUrlParser: true,
useUnifiedTopology: true,
}).then(() => {
log('Connected to MongoDB');
const port = process.env.PORT || 3000;
app.listen(port, () => {
log(User service running on port ${port});
});
}).catch(err => {
log(MongoDB connection error: ${err});
});

module.exports = app; 
