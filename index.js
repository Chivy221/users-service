const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();

const userRoutes = require('./routes/users');

app.use(express.json());
app.use('/users', userRoutes);
app.get('/ping', (_, res) => res.send('pong'));

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(3000, () => console.log('Users service running on port 3000'));
}).catch(err => console.error(err));
