const request = require('supertest');
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../index'); 

describe('Users API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, { /* same options */ });
  });
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  it('should create and retrieve a user', async () => {
    const post = await request(app)
      .post('/users')
      .send({ name: 'Alice', email: 'alice@example.com' })
      .expect(201);

    const id = post.body.id;

    const get = await request(app)
      .get(`/users/${id}`)
      .expect(200);

    expect(get.body.name).toBe('Alice');
    expect(get.body.email).toBe('alice@example.com');
  });
});
