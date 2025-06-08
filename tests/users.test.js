const request = require('supertest');
const app = require('../index');

describe('GET /ping', () => {
it('should return pong', async () => {
const res = await request(app).get('/ping');
expect(res.text).toBe('pong');
expect(res.statusCode).toBe(200);
});
});
