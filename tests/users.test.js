const request = require('supertest');
const app = require('../index');

describe('Users API', () => {
it('GET /users returns array', async () => {
const res = await request(app).get('/users');
expect(res.statusCode).toEqual(200);
expect(Array.isArray(res.body)).toBe(true);
});

it('POST /users creates user', async () => {
const res = await request(app).post('/users').send({
name: 'Test User',
email: 'test@example.com'
});
expect(res.statusCode).toEqual(201);
expect(res.body).toHaveProperty('_id');
});
});
