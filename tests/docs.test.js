import { expect } from 'chai';
import request from 'supertest';
import { app } from './setup.js';

describe('GET /api/docs', () => {
  it('sirve Swagger UI', async () => {
    const res = await request(app).get('/api/docs/');

    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.include('text/html');
    expect(res.text).to.include('Swagger UI');
  });
});
