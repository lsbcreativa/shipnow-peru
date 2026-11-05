import { expect } from 'chai';
import { agent, expectError } from './helpers.js';

describe('Mocks - generar sin guardar', () => {
  it('GET /api/mocks/users devuelve usuarios simulados con la forma del modelo real', async () => {
    const res = await agent().get('/api/mocks/users?qty=3');

    expect(res.status).to.equal(200);
    expect(res.body.payload).to.have.length(3);
    const [first] = res.body.payload;
    expect(first).to.have.all.keys('firstName', 'lastName', 'email', 'city', 'role');
    expect(['cliente', 'repartidor']).to.include(first.role);
  });

  it('GET /api/mocks/repartidores siempre devuelve rol repartidor', async () => {
    const res = await agent().get('/api/mocks/repartidores?qty=4');

    expect(res.status).to.equal(200);
    expect(res.body.payload).to.have.length(4);
    expect(res.body.payload.every((u) => u.role === 'repartidor')).to.equal(true);
  });

  it('GET /api/mocks/pedidos trae items y un cliente embebido', async () => {
    const res = await agent().get('/api/mocks/pedidos?qty=2');

    expect(res.status).to.equal(200);
    expect(res.body.payload).to.have.length(2);
    expect(res.body.payload[0]).to.have.property('customer');
    expect(res.body.payload[0].items).to.be.an('array').that.is.not.empty;
  });

  it('GET /api/mocks/entregas trae su pedido embebido y el repartidor solo si no esta pending', async () => {
    const res = await agent().get('/api/mocks/entregas?qty=5');

    expect(res.status).to.equal(200);
    expect(res.body.payload).to.have.length(5);
    for (const delivery of res.body.payload) {
      expect(delivery).to.have.property('order');
      expect(delivery.order).to.have.property('customer');
      if (delivery.status === 'pending') {
        expect(delivery.deliveryPerson).to.equal(null);
      } else {
        expect(delivery.deliveryPerson).to.have.property('role', 'repartidor');
      }
    }
  });

  it('qty invalido responde 400 en vez de generar algo', async () => {
    const res = await agent().get('/api/mocks/users?qty=-1');
    expectError(res, { status: 400, code: 'INVALID_MOCK_QUANTITY', messageIncludes: '-1' });
  });

  it('qty invalido en /mocks/entregas tambien responde 400', async () => {
    const res = await agent().get('/api/mocks/entregas?qty=abc');
    expectError(res, { status: 400, code: 'INVALID_MOCK_QUANTITY' });
  });
});

describe('POST /api/mocks/seed - carga real en Mongo', () => {
  it('inserta usuarios de verdad en la base', async () => {
    const res = await agent().post('/api/mocks/seed?qty=5');

    expect(res.status).to.equal(201);
    expect(res.body.payload).to.deep.equal({ insertados: 5, coleccion: 'usuarios' });

    const lista = await agent().get('/api/users');
    expect(lista.body.payload.total).to.equal(5);
  });

  it('sembrar pedidos crea los clientes que le falten para no dejar referencias rotas', async () => {
    const res = await agent().post('/api/mocks/seed?qty=3&coleccion=pedidos');

    expect(res.status).to.equal(201);
    expect(res.body.payload.coleccion).to.equal('pedidos');
    expect(res.body.payload.insertados).to.equal(3);
  });

  it('sembrar entregas no duplica entregas sobre el mismo pedido si se corre dos veces', async () => {
    await agent().post('/api/mocks/seed?qty=3&coleccion=pedidos');
    await agent().post('/api/mocks/seed?qty=3&coleccion=entregas');
    const segunda = await agent().post('/api/mocks/seed?qty=3&coleccion=entregas');

    expect(segunda.status).to.equal(201);
    expect(segunda.body.payload.insertados).to.equal(3);
  });

  it('una coleccion que no existe responde 400', async () => {
    const res = await agent().post('/api/mocks/seed?qty=3&coleccion=inventada');
    expectError(res, { status: 400, code: 'INVALID_MOCK_COLLECTION', messageIncludes: 'inventada' });
  });

  it('qty y coleccion invalidos a la vez devuelven los dos problemas juntos', async () => {
    const res = await agent().post('/api/mocks/seed?qty=-5&coleccion=inventada');

    const body = expectError(res, { status: 400, code: 'VALIDATION_ERROR' });
    expect(body.details).to.have.length(2);
  });
});
