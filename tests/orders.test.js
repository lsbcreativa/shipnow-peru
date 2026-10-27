import { expect } from 'chai';
import request from 'supertest';
import { app } from './setup.js';

const createCustomer = async (overrides = {}) => {
  const res = await request(app)
    .post('/api/users')
    .send({ firstName: 'Maria', lastName: 'Quispe', email: 'maria@mail.com', city: 'Cusco', ...overrides });
  return res.body.payload._id;
};

const validOrder = (customerId, overrides = {}) => ({
  customer: customerId,
  items: [{ name: 'Chompa de alpaca', quantity: 2, unitPrice: 89.9 }],
  destinationCity: 'Lima',
  ...overrides,
});

describe('Pedidos', () => {
  describe('POST /api/orders', () => {
    it('crea un pedido para un cliente que existe, con el total ya calculado', async () => {
      const customerId = await createCustomer();
      const res = await request(app).post('/api/orders').send(validOrder(customerId));

      expect(res.status).to.equal(201);
      expect(res.body.payload.totalAmount).to.equal(179.8);
      expect(res.body.payload.status).to.equal('pending');
      expect(res.body.payload.customer._id).to.equal(customerId);
    });

    it('si el cliente no existe responde 404', async () => {
      const res = await request(app).post('/api/orders').send(validOrder('665f2a3b9c1d4e5f6a7b8c9d'));

      expect(res.status).to.equal(404);
      expect(res.body.code).to.equal('NOT_FOUND');
    });

    it('sin items responde 400', async () => {
      const customerId = await createCustomer();
      const res = await request(app).post('/api/orders').send(validOrder(customerId, { items: [] }));

      expect(res.status).to.equal(400);
      expect(res.body.code).to.equal('VALIDATION_ERROR');
    });
  });

  describe('GET /api/orders/:id', () => {
    it('consulta un pedido ya creado', async () => {
      const customerId = await createCustomer();
      const created = await request(app).post('/api/orders').send(validOrder(customerId));

      const res = await request(app).get(`/api/orders/${created.body.payload._id}`);

      expect(res.status).to.equal(200);
      expect(res.body.payload.destinationCity).to.equal('Lima');
    });

    it('un pedido que no existe responde 404', async () => {
      const res = await request(app).get('/api/orders/665f2a3b9c1d4e5f6a7b8c9d');

      expect(res.status).to.equal(404);
      expect(res.body.code).to.equal('NOT_FOUND');
    });
  });

  describe('GET /api/orders', () => {
    it('lista los pedidos', async () => {
      const customerId = await createCustomer();
      await request(app).post('/api/orders').send(validOrder(customerId));

      const res = await request(app).get('/api/orders');

      expect(res.status).to.equal(200);
      expect(res.body.payload.items).to.have.length(1);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('cambia el estado de un pedido', async () => {
      const customerId = await createCustomer();
      const created = await request(app).post('/api/orders').send(validOrder(customerId));
      const id = created.body.payload._id;

      const res = await request(app).patch(`/api/orders/${id}/status`).send({ status: 'confirmed' });

      expect(res.status).to.equal(200);
      expect(res.body.payload.status).to.equal('confirmed');
    });

    it('un estado fuera del enum responde 400', async () => {
      const customerId = await createCustomer();
      const created = await request(app).post('/api/orders').send(validOrder(customerId));

      const res = await request(app).patch(`/api/orders/${created.body.payload._id}/status`).send({ status: 'volando' });

      expect(res.status).to.equal(400);
      expect(res.body.code).to.equal('INVALID_STATUS');
    });

    it('un pedido cancelado no admite otro cambio de estado', async () => {
      const customerId = await createCustomer();
      const created = await request(app).post('/api/orders').send(validOrder(customerId));
      const id = created.body.payload._id;

      await request(app).patch(`/api/orders/${id}/status`).send({ status: 'cancelled' });
      const res = await request(app).patch(`/api/orders/${id}/status`).send({ status: 'confirmed' });

      expect(res.status).to.equal(409);
      expect(res.body.code).to.equal('CONFLICT');
    });
  });
});
