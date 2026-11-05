import { expect } from 'chai';
import { agent, expectError } from './helpers.js';

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
      const res = await agent().post('/api/products').send(validProduct());

      expect(res.status).to.equal(201);
      expect(res.body.payload.status).to.equal('available');
      expect(res.body.payload.name).to.equal('Chompa de alpaca');
    });

    it('con stock 0 queda out_of_stock', async () => {
      const res = await agent().post('/api/products').send(validProduct({ stock: 0, name: 'Poncho' }));
      expect(res.body.payload.status).to.equal('out_of_stock');
    });

    it('precio negativo responde 400', async () => {
      const res = await agent().post('/api/products').send(validProduct({ price: -10 }));
      expectError(res, { status: 400, code: 'VALIDATION_ERROR', messageIncludes: 'precio' });
    });

    it('nombre repetido responde 409', async () => {
      await agent().post('/api/products').send(validProduct());
      const res = await agent().post('/api/products').send(validProduct());

      expectError(res, { status: 409, code: 'CONFLICT', messageIncludes: 'Ya existe' });
    });
  });

  describe('GET /api/products', () => {
    it('filtra por status', async () => {
      await agent().post('/api/products').send(validProduct());
      await agent().post('/api/products').send(validProduct({ name: 'Poncho', stock: 0 }));

      const res = await agent().get('/api/products?status=out_of_stock');

      expect(res.status).to.equal(200);
      expect(res.body.payload.items).to.have.length(1);
      expect(res.body.payload.items[0].name).to.equal('Poncho');
    });

    it('un status fuera del enum responde 400', async () => {
      const res = await agent().get('/api/products?status=no_existe');
      expectError(res, { status: 400, code: 'INVALID_STATUS', messageIncludes: 'no_existe' });
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('discontinua en vez de borrar, y de ahi no admite mas cambios', async () => {
      const created = await agent().post('/api/products').send(validProduct());
      const id = created.body.payload._id;

      const deleted = await agent().delete(`/api/products/${id}`);
      expect(deleted.status).to.equal(200);
      expect(deleted.body.payload.status).to.equal('discontinued');

      const again = await agent().delete(`/api/products/${id}`);
      expectError(again, { status: 409, code: 'CONFLICT', messageIncludes: 'discontinuado' });
    });

    it('un id con formato invalido responde 400', async () => {
      const res = await agent().delete('/api/products/no-es-un-id');
      expectError(res, { status: 400, code: 'VALIDATION_ERROR' });
    });
  });
});
