import { expect } from 'chai';
import { agent, expectError } from './helpers.js';

describe('GET /api/health', () => {
  it('responde el estado, entorno, uptime y timestamp, sin nada sensible', async () => {
    const res = await agent().get('/api/health');

    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('success');
    expect(res.body.environment).to.equal('test');
    expect(res.body.uptime).to.be.a('number');
    expect(res.body.timestamp).to.be.a('string');
    // nada de uri de mongo, puerto interno, etc.
    expect(res.body).to.not.have.any.keys('mongoUri', 'port', 'secret');
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
