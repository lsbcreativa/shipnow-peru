import { expect } from 'chai';
import request from 'supertest';
import { app } from './setup.js';

const validUser = (overrides = {}) => ({
  firstName: 'Maria',
  lastName: 'Quispe',
  email: 'maria@mail.com',
  city: 'Cusco',
  ...overrides,
});

describe('Usuarios', () => {
  describe('POST /api/users', () => {
    it('crea un usuario con rol cliente por defecto', async () => {
      const res = await request(app).post('/api/users').send(validUser());

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.include({ firstName: 'Maria', lastName: 'Quispe', email: 'maria@mail.com', role: 'cliente' });
      expect(res.body.payload.isActive).to.equal(true);
      expect(res.body.payload).to.have.property('_id');
    });

    it('si falta un campo obligatorio responde 400', async () => {
      const res = await request(app).post('/api/users').send({ firstName: 'Maria' });

      expect(res.status).to.equal(400);
      expect(res.body.code).to.equal('VALIDATION_ERROR');
    });

    it('un email repetido responde 409', async () => {
      await request(app).post('/api/users').send(validUser());
      const res = await request(app).post('/api/users').send(validUser({ firstName: 'Otra' }));

      expect(res.status).to.equal(409);
      expect(res.body.code).to.equal('CONFLICT');
    });
  });

  describe('GET /api/users', () => {
    it('lista los usuarios creados, paginado', async () => {
      await request(app).post('/api/users').send(validUser());
      await request(app).post('/api/users').send(validUser({ email: 'jose@mail.com', firstName: 'Jose' }));

      const res = await request(app).get('/api/users');

      expect(res.status).to.equal(200);
      expect(res.body.payload.items).to.have.length(2);
      expect(res.body.payload).to.include({ page: 1, limit: 10, total: 2 });
    });

    it('un limit no numerico responde 400 en vez de romper la paginacion', async () => {
      const res = await request(app).get('/api/users?limit=abc');

      expect(res.status).to.equal(400);
      expect(res.body.code).to.equal('VALIDATION_ERROR');
    });
  });

  describe('GET /api/users/:id', () => {
    it('devuelve el usuario pedido', async () => {
      const created = await request(app).post('/api/users').send(validUser());
      const res = await request(app).get(`/api/users/${created.body.payload._id}`);

      expect(res.status).to.equal(200);
      expect(res.body.payload.email).to.equal('maria@mail.com');
    });

    it('un id que no existe responde 404', async () => {
      const res = await request(app).get('/api/users/665f2a3b9c1d4e5f6a7b8c9d');

      expect(res.status).to.equal(404);
      expect(res.body.code).to.equal('NOT_FOUND');
    });

    it('un id con formato invalido responde 400, no 500', async () => {
      const res = await request(app).get('/api/users/no-es-un-id');

      expect(res.status).to.equal(400);
      expect(res.body.code).to.equal('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('desactiva el usuario (baja logica) en vez de borrarlo', async () => {
      const created = await request(app).post('/api/users').send(validUser());
      const id = created.body.payload._id;

      const res = await request(app).delete(`/api/users/${id}`);
      expect(res.status).to.equal(200);
      expect(res.body.payload.isActive).to.equal(false);

      // una vez desactivado, dejo de aparecer en GET /:id (que solo busca usuarios activos)
      const after = await request(app).get(`/api/users/${id}`);
      expect(after.status).to.equal(404);
    });
  });
});
