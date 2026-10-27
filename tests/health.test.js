import { expect } from 'chai';
import request from 'supertest';
import { app } from './setup.js';

describe('GET /api/health', () => {
  it('responde que el servidor esta arriba', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('success');
    expect(res.body.message).to.be.a('string');
  });
});

describe('rutas inexistentes', () => {
  it('una ruta que no existe responde 404 con el formato de error', async () => {
    const res = await request(app).get('/api/esto-no-existe');

    expect(res.status).to.equal(404);
    expect(res.body.status).to.equal('error');
    expect(res.body.code).to.equal('NOT_FOUND');
    expect(res.body.message).to.include('/api/esto-no-existe');
  });
});

describe('body mal formado', () => {
  it('un JSON invalido en el body responde 400, no 500', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Content-Type', 'application/json')
      .send('{ esto no es json');

    expect(res.status).to.equal(400);
    expect(res.body.code).to.equal('VALIDATION_ERROR');
  });
});
