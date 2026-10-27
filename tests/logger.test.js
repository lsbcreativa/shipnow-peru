import { expect } from 'chai';
import request from 'supertest';
import { app } from './setup.js';

describe('GET /api/logs/test', () => {
  it('dispara los 6 niveles y responde 200', async () => {
    const res = await request(app).get('/api/logs/test');

    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('success');
    expect(res.body.payload.message).to.include('6 niveles');
  });
});
