const request = require('supertest');
const express = require('express');
const router = require('../routes/users');
const app = express();
app.use(express.json());
app.use('/users', router);

describe('Users API', () => {
it('GET /users should return status 200', async () => {
const res = await request(app).get('/users');
expect(res.statusCode).toBe(200);
});

it('POST /users should return 201', async () => {
const res = await request(app)
.post('/users')
.send({ name: 'Test User', email: 'test@example.com' });
expect(res.statusCode).toBe(201);
});
});
