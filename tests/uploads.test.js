import { expect } from 'chai';
import fs from 'fs';
import { agent, expectError, createUser, createOrder } from './helpers.js';

const pdfBuffer = Buffer.from('%PDF-1.4 contenido de prueba, no es un pdf real pero el mimetype si importa');

describe('POST /api/users/:id/documents', () => {
  it('sube un documento valido y lo deja registrado en el usuario', async () => {
    const user = await createUser();

    const res = await agent()
      .post(`/api/users/${user._id}/documents`)
      .field('documentType', 'dni')
      .attach('document', pdfBuffer, { filename: 'dni.pdf', contentType: 'application/pdf' });

    expect(res.status).to.equal(201);
    expect(res.body.payload.documents).to.have.length(1);
    const [doc] = res.body.payload.documents;
    expect(doc.documentType).to.equal('dni');
    expect(doc.originalName).to.equal('dni.pdf');
    expect(doc.mimeType).to.equal('application/pdf');
    // la ruta tiene que ser relativa, no la ruta absoluta del server
    expect(doc.path).to.not.include('C:\\');
    expect(fs.existsSync(doc.path)).to.equal(true);
  });

  it('sin archivo responde 400', async () => {
    const user = await createUser();
    const res = await agent().post(`/api/users/${user._id}/documents`).field('documentType', 'dni');

    expectError(res, { status: 400, code: 'FILE_REQUIRED', messageIncludes: 'document' });
  });

  it('un documentType que no esta en el enum responde 400', async () => {
    const user = await createUser();
    const res = await agent()
      .post(`/api/users/${user._id}/documents`)
      .field('documentType', 'pasaporte_marciano')
      .attach('document', pdfBuffer, { filename: 'x.pdf', contentType: 'application/pdf' });

    expectError(res, { status: 400, code: 'INVALID_DOCUMENT_TYPE', messageIncludes: 'pasaporte_marciano' });
  });

  it('un tipo de archivo no permitido responde 400', async () => {
    const user = await createUser();
    const res = await agent()
      .post(`/api/users/${user._id}/documents`)
      .field('documentType', 'dni')
      .attach('document', pdfBuffer, { filename: 'x.zip', contentType: 'application/zip' });

    expectError(res, { status: 400, code: 'INVALID_FILE_TYPE', messageIncludes: 'application/zip' });
  });

  it('un usuario que no existe responde 404', async () => {
    const res = await agent()
      .post('/api/users/665f2a3b9c1d4e5f6a7b8c9d/documents')
      .field('documentType', 'dni')
      .attach('document', pdfBuffer, { filename: 'x.pdf', contentType: 'application/pdf' });

    expectError(res, { status: 404, code: 'NOT_FOUND', messageIncludes: 'usuario' });
  });

  it('un id armado para escapar de uploads/ se rechaza antes de que Multer toque el filesystem', async () => {
    // el id se usa para armar la carpeta de destino en upload.config.js, asi
    // que tiene que ser rechazado por formato (no un objectid valido) antes
    // de llegar a Multer -- si esto alguna vez responde 201, algo escribio
    // afuera de uploads/
    const res = await agent()
      .post('/api/users/..%2f..%2f..%2fmalicious/documents')
      .field('documentType', 'dni')
      .attach('document', pdfBuffer, { filename: 'x.pdf', contentType: 'application/pdf' });

    expect(res.status).to.be.oneOf([400, 404]);
    expect(res.body.status).to.equal('error');
  });
});

describe('POST /api/orders/:id/receipt', () => {
  it('sube un comprobante valido y lo deja registrado en el pedido', async () => {
    const order = await createOrder();

    const res = await agent()
      .post(`/api/orders/${order._id}/receipt`)
      .attach('receipt', pdfBuffer, { filename: 'comprobante.jpg', contentType: 'image/jpeg' });

    expect(res.status).to.equal(201);
    expect(res.body.payload.receipts).to.have.length(1);
    expect(res.body.payload.receipts[0].originalName).to.equal('comprobante.jpg');
  });

  it('sin archivo responde 400', async () => {
    const order = await createOrder();
    const res = await agent().post(`/api/orders/${order._id}/receipt`);
    expectError(res, { status: 400, code: 'FILE_REQUIRED', messageIncludes: 'receipt' });
  });

  it('un pedido que no existe responde 404', async () => {
    const res = await agent()
      .post('/api/orders/665f2a3b9c1d4e5f6a7b8c9d/receipt')
      .attach('receipt', pdfBuffer, { filename: 'comprobante.jpg', contentType: 'image/jpeg' });

    expectError(res, { status: 404, code: 'NOT_FOUND', messageIncludes: 'pedido' });
  });
});
