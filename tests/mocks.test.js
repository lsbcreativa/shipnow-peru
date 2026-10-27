import { expect } from 'chai';
import request from 'supertest';
import { app } from './setup.js';

describe('Mocks - generar sin guardar', () => {
  it('GET /api/mocks/users devuelve usuarios simulados con la forma del modelo real', async () => {
    const res = await request(app).get('/api/mocks/users?qty=3');

    expect(res.status).to.equal(200);
    expect(res.body.payload).to.have.length(3);
    const [first] = res.body.payload;
    expect(first).to.have.all.keys('firstName', 'lastName', 'email', 'city', 'role');
    expect(['cliente', 'repartidor']).to.include(first.role);
  });

  it('GET /api/mocks/repartidores siempre devuelve rol repartidor', async () => {
    const res = await request(app).get('/api/mocks/repartidores?qty=4');

    expect(res.status).to.equal(200);
    expect(res.body.payload).to.have.length(4);
    expect(res.body.payload.every((u) => u.role === 'repartidor')).to.equal(true);
  });

  it('GET /api/mocks/pedidos trae items y un cliente embebido', async () => {
    const res = await request(app).get('/api/mocks/pedidos?qty=2');

    expect(res.status).to.equal(200);
    expect(res.body.payload).to.have.length(2);
    expect(res.body.payload[0]).to.have.property('customer');
    expect(res.body.payload[0].items).to.be.an('array').that.is.not.empty;
  });

  it('qty invalido responde 400 en vez de generar algo', async () => {
    const res = await request(app).get('/api/mocks/users?qty=-1');

    expect(res.status).to.equal(400);
    expect(res.body.code).to.equal('INVALID_MOCK_QUANTITY');
  });
});

describe('POST /api/mocks/seed - carga real en Mongo', () => {
  it('inserta usuarios de verdad en la base', async () => {
    const res = await request(app).post('/api/mocks/seed?qty=5');

    expect(res.status).to.equal(201);
    expect(res.body.payload).to.deep.equal({ insertados: 5, coleccion: 'usuarios' });

    const lista = await request(app).get('/api/users');
    expect(lista.body.payload.total).to.equal(5);
  });

  it('sembrar pedidos crea los clientes que le falten para no dejar referencias rotas', async () => {
    const res = await request(app).post('/api/mocks/seed?qty=3&coleccion=pedidos');

    expect(res.status).to.equal(201);
    expect(res.body.payload.coleccion).to.equal('pedidos');
    expect(res.body.payload.insertados).to.equal(3);
  });

  it('una coleccion que no existe responde 400', async () => {
    const res = await request(app).post('/api/mocks/seed?qty=3&coleccion=inventada');

    expect(res.status).to.equal(400);
    expect(res.body.code).to.equal('INVALID_MOCK_COLLECTION');
  });

  it('qty y coleccion invalidos a la vez devuelven los dos problemas juntos', async () => {
    const res = await request(app).post('/api/mocks/seed?qty=-5&coleccion=inventada');

    expect(res.status).to.equal(400);
    expect(res.body.code).to.equal('VALIDATION_ERROR');
    expect(res.body.details).to.have.length(2);
  });
});
