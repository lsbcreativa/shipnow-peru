import { expect } from 'chai';
import { agent, expectError } from './helpers.js';

describe('GET /api/logs/test', () => {
  it('dispara los 6 niveles y responde 200', async () => {
    const res = await agent().get('/api/logs/test');

    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('success');
    expect(res.body.payload.message).to.include('6 niveles');
  });

  it('con otro metodo no hay ninguna ruta registrada, responde 404', async () => {
    const res = await agent().post('/api/logs/test');
    expectError(res, { status: 404, code: 'NOT_FOUND', messageIncludes: '/api/logs/test' });
  });
});
