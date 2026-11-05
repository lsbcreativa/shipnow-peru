import { expect } from 'chai';
import { agent, expectError, createUser, createOrder } from './helpers.js';

describe('Pedidos', () => {
  describe('POST /api/orders', () => {
    it('crea un pedido para un cliente que existe, con el total ya calculado', async () => {
      const customer = await createUser();
      const res = await agent()
        .post('/api/orders')
        .send({ customer: customer._id, items: [{ name: 'Chompa de alpaca', quantity: 2, unitPrice: 89.9 }], destinationCity: 'Lima' });

      expect(res.status).to.equal(201);
      expect(res.body.payload.totalAmount).to.equal(179.8);
      expect(res.body.payload.status).to.equal('pending');
      expect(res.body.payload.customer._id).to.equal(customer._id);
    });

    it('si el cliente no existe responde 404', async () => {
      const res = await agent()
        .post('/api/orders')
        .send({ customer: '665f2a3b9c1d4e5f6a7b8c9d', items: [{ name: 'x', quantity: 1, unitPrice: 10 }], destinationCity: 'Lima' });

      expectError(res, { status: 404, code: 'NOT_FOUND', messageIncludes: 'cliente' });
    });

    it('sin items responde 400', async () => {
      const customer = await createUser();
      const res = await agent().post('/api/orders').send({ customer: customer._id, items: [], destinationCity: 'Lima' });

      expectError(res, { status: 400, code: 'VALIDATION_ERROR', messageIncludes: 'item' });
    });
  });

  describe('GET /api/orders/:id', () => {
    it('consulta un pedido ya creado', async () => {
      const order = await createOrder();
      const res = await agent().get(`/api/orders/${order._id}`);

      expect(res.status).to.equal(200);
      expect(res.body.payload.destinationCity).to.equal('Lima');
    });

    it('un pedido que no existe responde 404', async () => {
      const res = await agent().get('/api/orders/665f2a3b9c1d4e5f6a7b8c9d');
      expectError(res, { status: 404, code: 'NOT_FOUND', messageIncludes: 'pedido' });
    });
  });

  describe('GET /api/orders', () => {
    it('lista los pedidos', async () => {
      await createOrder();
      const res = await agent().get('/api/orders');

      expect(res.status).to.equal(200);
      expect(res.body.payload.items).to.have.length(1);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('cambia el estado de un pedido', async () => {
      const order = await createOrder();
      const res = await agent().patch(`/api/orders/${order._id}/status`).send({ status: 'confirmed' });

      expect(res.status).to.equal(200);
      expect(res.body.payload.status).to.equal('confirmed');
    });

    it('un estado fuera del enum responde 400', async () => {
      const order = await createOrder();
      const res = await agent().patch(`/api/orders/${order._id}/status`).send({ status: 'volando' });

      expectError(res, { status: 400, code: 'INVALID_STATUS', messageIncludes: 'volando' });
    });

    it('un pedido cancelado no admite otro cambio de estado', async () => {
      const order = await createOrder();
      await agent().patch(`/api/orders/${order._id}/status`).send({ status: 'cancelled' });
      const res = await agent().patch(`/api/orders/${order._id}/status`).send({ status: 'confirmed' });

      expectError(res, { status: 409, code: 'CONFLICT', messageIncludes: 'cancelado' });
    });
  });
});
