import { expect } from 'chai';
import { agent, expectError, createUser } from './helpers.js';

describe('Usuarios', () => {
  describe('POST /api/users', () => {
    it('crea un usuario con rol cliente por defecto', async () => {
      const res = await agent().post('/api/users').send({ firstName: 'Maria', lastName: 'Quispe', email: 'maria@mail.com', city: 'Cusco' });

      expect(res.status).to.equal(201);
      expect(res.body.payload).to.include({ firstName: 'Maria', lastName: 'Quispe', email: 'maria@mail.com', role: 'cliente' });
      expect(res.body.payload.isActive).to.equal(true);
      expect(res.body.payload).to.have.property('_id');
    });

    it('si falta un campo obligatorio responde 400', async () => {
      const res = await agent().post('/api/users').send({ firstName: 'Maria' });
      expectError(res, { status: 400, code: 'VALIDATION_ERROR', messageIncludes: 'Faltan datos' });
    });

    it('un email repetido responde 409', async () => {
      await createUser();
      const res = await agent().post('/api/users').send({ firstName: 'Otra', lastName: 'Persona', email: 'maria@mail.com', city: 'Lima' });

      expectError(res, { status: 409, code: 'CONFLICT', messageIncludes: 'Ya existe' });
    });
  });

  describe('GET /api/users', () => {
    it('lista los usuarios creados, paginado', async () => {
      await createUser();
      await createUser({ email: 'jose@mail.com', firstName: 'Jose' });

      const res = await agent().get('/api/users');

      expect(res.status).to.equal(200);
      expect(res.body.payload.items).to.have.length(2);
      expect(res.body.payload).to.include({ page: 1, limit: 10, total: 2 });
    });

    it('un limit no numerico responde 400 en vez de romper la paginacion', async () => {
      const res = await agent().get('/api/users?limit=abc');
      expectError(res, { status: 400, code: 'VALIDATION_ERROR', messageIncludes: 'limit' });
    });
  });

  describe('GET /api/users/:id', () => {
    it('devuelve el usuario pedido', async () => {
      const created = await createUser();
      const res = await agent().get(`/api/users/${created._id}`);

      expect(res.status).to.equal(200);
      expect(res.body.payload.email).to.equal('maria@mail.com');
    });

    it('un id que no existe responde 404', async () => {
      const res = await agent().get('/api/users/665f2a3b9c1d4e5f6a7b8c9d');
      expectError(res, { status: 404, code: 'NOT_FOUND', messageIncludes: 'usuario' });
    });

    it('un id con formato invalido responde 400, no 500', async () => {
      const res = await agent().get('/api/users/no-es-un-id');
      expectError(res, { status: 400, code: 'VALIDATION_ERROR' });
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('desactiva el usuario (baja logica) en vez de borrarlo', async () => {
      const created = await createUser();

      const res = await agent().delete(`/api/users/${created._id}`);
      expect(res.status).to.equal(200);
      expect(res.body.payload.isActive).to.equal(false);

      // una vez desactivado, dejo de aparecer en GET /:id (que solo busca usuarios activos)
      const after = await agent().get(`/api/users/${created._id}`);
      expect(after.status).to.equal(404);
    });
  });
});
