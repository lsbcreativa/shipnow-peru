import { expect } from 'chai';
import request from 'supertest';
import { app } from './setup.js';

const validProduct = (overrides = {}) => ({
  name: 'Chompa de alpaca',
  description: 'Chompa 100% alpaca, talla M',
  category: 'ropa',
  price: 89.9,
  stock: 15,
  city: 'Arequipa',
  ...overrides,
});

describe('Productos', () => {
  describe('POST /api/products', () => {
    it('crea un producto disponible cuando tiene stock', async () => {
      const res = await request(app).post('/api/products').send(validProduct());

      expect(res.status).to.equal(201);
      expect(res.body.payload.status).to.equal('available');
      expect(res.body.payload.name).to.equal('Chompa de alpaca');
    });

    it('con stock 0 queda out_of_stock', async () => {
      const res = await request(app).post('/api/products').send(validProduct({ stock: 0, name: 'Poncho' }));

      expect(res.body.payload.status).to.equal('out_of_stock');
    });

    it('precio negativo responde 400', async () => {
      const res = await request(app).post('/api/products').send(validProduct({ price: -10 }));

      expect(res.status).to.equal(400);
      expect(res.body.code).to.equal('VALIDATION_ERROR');
    });

    it('nombre repetido responde 409', async () => {
      await request(app).post('/api/products').send(validProduct());
      const res = await request(app).post('/api/products').send(validProduct());

      expect(res.status).to.equal(409);
      expect(res.body.code).to.equal('CONFLICT');
    });
  });

  describe('GET /api/products', () => {
    it('filtra por status', async () => {
      await request(app).post('/api/products').send(validProduct());
      await request(app).post('/api/products').send(validProduct({ name: 'Poncho', stock: 0 }));

      const res = await request(app).get('/api/products?status=out_of_stock');

      expect(res.status).to.equal(200);
      expect(res.body.payload.items).to.have.length(1);
      expect(res.body.payload.items[0].name).to.equal('Poncho');
    });

    it('un status fuera del enum responde 400', async () => {
      const res = await request(app).get('/api/products?status=no_existe');

      expect(res.status).to.equal(400);
      expect(res.body.code).to.equal('INVALID_STATUS');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('discontinua en vez de borrar, y de ahi no admite mas cambios', async () => {
      const created = await request(app).post('/api/products').send(validProduct());
      const id = created.body.payload._id;

      const deleted = await request(app).delete(`/api/products/${id}`);
      expect(deleted.status).to.equal(200);
      expect(deleted.body.payload.status).to.equal('discontinued');

      const again = await request(app).delete(`/api/products/${id}`);
      expect(again.status).to.equal(409);
      expect(again.body.code).to.equal('CONFLICT');
    });

    it('un id con formato invalido responde 400', async () => {
      const res = await request(app).delete('/api/products/no-es-un-id');

      expect(res.status).to.equal(400);
      expect(res.body.code).to.equal('VALIDATION_ERROR');
    });
  });
});
