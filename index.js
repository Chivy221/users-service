const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const userRoutes = require('./routes/users');
const cache = require('./cache');

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

app.get('/ping', (_, res) => res.send('pong'));
app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.get('/metrics', (_, res) =>
  res.json({ users_cache: cache.keys().length })
);

// logging
app.use((req, res, next) => {
  const logLine = `${new Date().toISOString()} ${req.method} ${req.path}\n`;
  fs.appendFileSync(process.env.LOG_FILE || 'users.log', logLine);
  next();
});

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('🗄 Users DB connected');
  app.listen(process.env.PORT || 3000, () =>
    console.log(`Users service running on port ${process.env.PORT || 3000}`)
  );
})
.catch(err => console.error('MongoDB connection error:', err));
