import { expect } from 'chai';
import { agent, expectError } from './helpers.js';

describe('GET /api/docs', () => {
  it('sirve Swagger UI', async () => {
    const res = await agent().get('/api/docs/');

    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.include('text/html');
    expect(res.text).to.include('Swagger UI');
  });

  it('un metodo que no esta montado en /docs responde 404 con el formato de error', async () => {
    const res = await agent().post('/api/docs/');
    expectError(res, { status: 404, code: 'NOT_FOUND' });
  });
});

// el test anterior solo miraba el HTML ("dice Swagger UI"); esto lee el spec
// de verdad y chequea que lo documentado sea lo que la API hace, no solo que
// la pagina cargue.
describe('GET /api/docs/openapi.json', () => {
  let spec;

  before(async () => {
    const res = await agent().get('/api/docs/openapi.json');
    expect(res.status).to.equal(200);
    spec = res.body;
  });

  it('declara los tags esperados', () => {
    const tagNames = spec.tags.map((tag) => tag.name);
    expect(tagNames).to.include.members(['Health', 'Products', 'Users', 'Orders', 'Deliveries', 'Mocks', 'Logger']);
  });

  it('declara los schemas reutilizables clave', () => {
    expect(Object.keys(spec.components.schemas)).to.include.members([
      'User',
      'Order',
      'Delivery',
      'OrderItem',
      'UserDocument',
      'Receipt',
      'ErrorResponse',
      'SuccessResponse',
    ]);
  });

  it('cada ruta documentada responde de verdad (no cae en el 404 de ruta inexistente)', async () => {
    const rutasQueSePuedenProbarSinDatos = ['/health', '/users', '/orders', '/mocks/entregas', '/logs/test', '/products'];

    for (const ruta of rutasQueSePuedenProbarSinDatos) {
      expect(spec.paths).to.have.property(ruta);
      const res = await agent().get(`/api${ruta}`);
      expect(res.status, `GET ${ruta} documentado pero responde 404 en la API real`).to.not.equal(404);
    }
  });
});
