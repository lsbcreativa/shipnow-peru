import { expect } from 'chai';
import { agent, expectError } from './helpers.js';

describe('GET /api/health', () => {
  it('responde que el servidor esta arriba', async () => {
    const res = await agent().get('/api/health');

    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('success');
    expect(res.body.message).to.be.a('string');
  });
});

describe('rutas inexistentes', () => {
  it('una ruta que no existe responde 404 con el formato de error', async () => {
    const res = await agent().get('/api/esto-no-existe');
    expectError(res, { status: 404, code: 'NOT_FOUND', messageIncludes: '/api/esto-no-existe' });
  });
});

describe('body mal formado', () => {
  it('un JSON invalido en el body responde 400, no 500', async () => {
    const res = await agent().post('/api/products').set('Content-Type', 'application/json').send('{ esto no es json');
    expectError(res, { status: 400, code: 'VALIDATION_ERROR', messageIncludes: 'JSON' });
  });
});
