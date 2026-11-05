import { expect } from 'chai';
import request from 'supertest';
import { app } from './setup.js';

export const agent = () => request(app);

// un solo lugar que sabe como se ve un error de ShipNow: status + code +
// que el message venga (y, si queremos ser puntillosos, que diga tal cosa).
// antes cada test chequeaba status y code nomas; la consigna pide tambien
// el mensaje, asi que lo exigimos siempre, aca, en un solo lugar.
export const expectError = (res, { status, code, messageIncludes } = {}) => {
  expect(res.status).to.equal(status);
  expect(res.body.status).to.equal('error');
  expect(res.body.code).to.equal(code);
  expect(res.body.message).to.be.a('string').and.not.empty;
  if (messageIncludes) {
    expect(res.body.message).to.include(messageIncludes);
  }
  return res.body;
};

export const createUser = async (overrides = {}) => {
  const res = await agent()
    .post('/api/users')
    .send({ firstName: 'Maria', lastName: 'Quispe', email: 'maria@mail.com', city: 'Cusco', ...overrides });
  return res.body.payload;
};

export const createOrder = async (overrides = {}) => {
  const { customer, ...rest } = overrides;
  const customerId = customer || (await createUser())._id;

  const res = await agent()
    .post('/api/orders')
    .send({
      customer: customerId,
      items: [{ name: 'Chompa de alpaca', quantity: 2, unitPrice: 89.9 }],
      destinationCity: 'Lima',
      ...rest,
    });
  return res.body.payload;
};
