import { config } from './env.config.js';

// Spec de OpenAPI escrito a mano (sin swagger-jsdoc), separado a proposito de
// src/routes/ para no mezclar la doc con la logica de las rutas. Las rutas no
// saben que esto existe; esto no sabe nada de express.

const schemas = {
  User: {
    type: 'object',
    description: 'Usuario ya guardado en MongoDB (lo que devuelven /users).',
    properties: {
      _id: { type: 'string', example: '665f28f19c1d4e5f6a7b8c91' },
      firstName: { type: 'string', example: 'Maria' },
      lastName: { type: 'string', example: 'Quispe' },
      email: { type: 'string', example: 'maria@mail.com' },
      city: { type: 'string', example: 'Cusco' },
      role: { type: 'string', enum: ['admin', 'cliente', 'repartidor'], example: 'cliente' },
      isActive: { type: 'boolean', example: true },
      documents: { type: 'array', items: { $ref: '#/components/schemas/UserDocument' } },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  UserPreview: {
    type: 'object',
    description: 'Usuario simulado por el modulo de mocks. No tiene _id ni timestamps porque no se guardo en ningun lado.',
    properties: {
      firstName: { type: 'string', example: 'Jorge Luis' },
      lastName: { type: 'string', example: 'Hinojosa Saenz' },
      email: { type: 'string', example: 'jorgeluis_hinojosasaenz@test.com' },
      city: { type: 'string', example: 'Huancayo' },
      role: { type: 'string', enum: ['cliente', 'repartidor'], example: 'cliente' },
    },
  },

  Product: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '665f2a3b9c1d4e5f6a7b8c9d' },
      name: { type: 'string', example: 'Chompa de alpaca' },
      description: { type: 'string', example: 'Chompa 100% alpaca, talla M' },
      category: { type: 'string', example: 'ropa' },
      price: { type: 'number', example: 89.9 },
      stock: { type: 'number', example: 15 },
      city: { type: 'string', example: 'Arequipa' },
      status: { type: 'string', enum: ['available', 'out_of_stock', 'discontinued'], example: 'available' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  OrderItem: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Chocolate de Cusco' },
      quantity: { type: 'number', example: 3 },
      unitPrice: { type: 'number', example: 25.5 },
    },
  },

  Order: {
    type: 'object',
    description:
      '"customer" aparece poblado con el User real cuando el pedido viene de POST/GET /orders (ya guardado en Mongo). ' +
      'Cuando viene de GET /mocks/pedidos (sin guardar) trae un UserPreview embebido en su lugar.',
    properties: {
      _id: { type: 'string', example: '665f2a3b9c1d4e5f6a7b8c9d' },
      customer: { oneOf: [{ $ref: '#/components/schemas/User' }, { $ref: '#/components/schemas/UserPreview' }] },
      items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
      totalAmount: { type: 'number', example: 184.72 },
      destinationCity: { type: 'string', example: 'Arequipa' },
      status: {
        type: 'string',
        enum: ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'],
        example: 'confirmed',
      },
      priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
      receipts: { type: 'array', items: { $ref: '#/components/schemas/Receipt' } },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  Delivery: {
    type: 'object',
    description: 'Entrega tal cual la devuelve GET /mocks/entregas, con su pedido embebido. No hay un CRUD real de entregas todavia.',
    properties: {
      order: { $ref: '#/components/schemas/Order' },
      deliveryPerson: {
        nullable: true,
        allOf: [{ $ref: '#/components/schemas/UserPreview' }],
        description: 'null si la entrega todavia esta en estado pending (no se asigno repartidor)',
      },
      deliveryAddress: { type: 'string', example: 'Jr. Aldea Gustavo, Piura' },
      status: {
        type: 'string',
        enum: ['pending', 'assigned', 'in_transit', 'delivered', 'failed'],
        example: 'assigned',
      },
    },
  },

  UserDocument: {
    type: 'object',
    description: 'Metadata del archivo. El archivo en si se guarda en disco, acá solo quedan los datos.',
    properties: {
      originalName: { type: 'string', example: 'dni-maria.pdf' },
      storedName: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf' },
      path: { type: 'string', example: 'uploads/users/665f28f19c1d4e5f6a7b8c91/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf' },
      mimeType: { type: 'string', example: 'application/pdf' },
      size: { type: 'number', example: 204800 },
      documentType: { type: 'string', enum: ['dni', 'licencia_de_conducir', 'comprobante_domicilio'], example: 'dni' },
      uploadedAt: { type: 'string', format: 'date-time' },
    },
  },

  Receipt: {
    type: 'object',
    description: 'Metadata de un comprobante de pedido. El archivo en si se guarda en disco, acá solo quedan los datos.',
    properties: {
      originalName: { type: 'string', example: 'comprobante.jpg' },
      storedName: { type: 'string', example: 'b2c3d4e5-f678-9012-bcde-f23456789012.jpg' },
      path: { type: 'string', example: 'uploads/orders/665f2a3b9c1d4e5f6a7b8c9d/b2c3d4e5-f678-9012-bcde-f23456789012.jpg' },
      mimeType: { type: 'string', example: 'image/jpeg' },
      size: { type: 'number', example: 102400 },
      uploadedAt: { type: 'string', format: 'date-time' },
    },
  },

  SeedResult: {
    type: 'object',
    description: 'Lo que devuelve POST /mocks/seed despues de insertar en Mongo.',
    properties: {
      insertados: { type: 'number', example: 10 },
      coleccion: { type: 'string', enum: ['usuarios', 'repartidores', 'pedidos', 'entregas'], example: 'usuarios' },
    },
  },

  SuccessResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['success'] },
      payload: {},
    },
  },

  ErrorResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['error'] },
      code: {
        type: 'string',
        enum: [
          'VALIDATION_ERROR',
          'NOT_FOUND',
          'CONFLICT',
          'INVALID_STATUS',
          'INVALID_MOCK_QUANTITY',
          'INVALID_MOCK_COLLECTION',
          'MOCK_SEED_FAILED',
          'FILE_REQUIRED',
          'INVALID_FILE_TYPE',
          'FILE_TOO_LARGE',
          'INVALID_DOCUMENT_TYPE',
          'FILE_STORAGE_FAILED',
          'INTERNAL_ERROR',
        ],
      },
      message: { type: 'string' },
      details: { type: 'array', items: { type: 'string' }, description: 'solo aparece en algunos VALIDATION_ERROR' },
    },
  },
};

// Cada error de acá abajo se arma dentro de cada endpoint (no como un objeto
// compartido), porque reusar un solo ejemplo para todos los 400 de la API
// terminaba mostrando codigos que ese endpoint puntual nunca devuelve.
const errorExample = (code, message, details) => ({ status: 'error', code, message, ...(details ? { details } : {}) });

const errorContent = (example) => ({ 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example } });

const errorContentMulti = (examples) => ({
  'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, examples },
});

const badRequest = (description, example) => ({ description, content: errorContent(example) });
const badRequestMulti = (description, examples) => ({ description, content: errorContentMulti(examples) });
const notFound = (description, example) => ({ description, content: errorContent(example) });
const conflict = (description, example) => ({ description, content: errorContent(example) });
const serverError = (description, example) => ({ description, content: errorContent(example) });

const badId = (resource) =>
  errorExample('VALIDATION_ERROR', `El valor "no-es-un-id" no tiene un formato valido para "_id"`);

const paginatedPayload = (itemsRef) => ({
  type: 'object',
  properties: {
    items: { type: 'array', items: { $ref: itemsRef } },
    page: { type: 'number', example: 1 },
    limit: { type: 'number', example: 10 },
    total: { type: 'number', example: 42 },
    totalPages: { type: 'number', example: 5 },
  },
});

const successEnvelope = (payloadSchema, example, description = 'OK') => ({
  description,
  content: {
    'application/json': {
      schema: {
        allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { type: 'object', properties: { payload: payloadSchema } }],
      },
      ...(example ? { example: { status: 'success', payload: example } } : {}),
    },
  },
});

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: 'ObjectId de Mongo. Si el formato no es valido, responde 400 (no 404).',
};

const qtyParam = {
  name: 'qty',
  in: 'query',
  required: false,
  schema: { type: 'integer', minimum: 1, maximum: 50 },
  description: 'Cuantos registros generar. Default 5. Si viene en 0, negativo o no numerico, responde 400. Por encima de 50 se recorta solo.',
};

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'ShipNow Peru API',
    version: '1.0.0',
    description:
      'API REST de ShipNow Peru: venta y despacho de productos a todo el Peru. Proyecto de Backend III (Coderhouse). ' +
      'Arquitectura por capas (controller -> service -> repository), manejo de errores centralizado y modulo de mocks para datos de prueba.',
  },
  servers: [{ url: `http://localhost:${config.port}/api`, description: 'Servidor local' }],
  tags: [
    { name: 'Health', description: 'Chequeo de que el servidor esta vivo' },
    { name: 'Products', description: 'Catalogo de productos' },
    { name: 'Users', description: 'Usuarios de la plataforma (clientes y repartidores)' },
    { name: 'Orders', description: 'Pedidos: CRUD basico (crear, listar, ver por id, cambiar estado)' },
    { name: 'Deliveries', description: 'Entregas. Todavia no tienen CRUD propio, solo existen via el modulo de mocks' },
    { name: 'Mocks', description: 'Generacion y carga de datos de prueba (usuarios, repartidores, pedidos, entregas)' },
    { name: 'Logger', description: 'Endpoint de diagnostico del sistema de logs, no es logica de negocio' },
  ],
  components: { schemas },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Ver si el servidor esta activo',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
                example: { status: 'success', message: 'ShipNow Peru esta en linea' },
              },
            },
          },
        },
      },
    },

    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Listar productos',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'city', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['available', 'out_of_stock', 'discontinued'] } },
        ],
        responses: {
          200: successEnvelope(paginatedPayload('#/components/schemas/Product')),
          400: badRequestMulti('page/limit invalidos, o status fuera del enum', {
            estadoInvalido: {
              summary: 'status fuera del enum',
              value: errorExample('INVALID_STATUS', 'El estado "no_existe" no es valido. Usa uno de: available, out_of_stock, discontinued.'),
            },
            paginacionInvalida: {
              summary: 'limit no numerico',
              value: errorExample('VALIDATION_ERROR', 'El parametro "limit" tiene que ser un numero entero mayor a cero, recibimos "abc"'),
            },
          }),
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Crear un producto',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'description', 'category', 'price', 'city'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  price: { type: 'number', minimum: 0 },
                  stock: { type: 'number', minimum: 0, default: 0 },
                  city: { type: 'string' },
                },
              },
              example: {
                name: 'Chompa de alpaca',
                description: 'Chompa 100% alpaca, talla M',
                category: 'ropa',
                price: 89.9,
                stock: 15,
                city: 'Arequipa',
              },
            },
          },
        },
        responses: {
          201: successEnvelope({ $ref: '#/components/schemas/Product' }),
          400: badRequest('falta un campo obligatorio, o price/stock negativo', errorExample('VALIDATION_ERROR', 'Faltan datos obligatorios del producto')),
          409: conflict('ya existe un producto con ese nombre', errorExample('CONFLICT', 'Ya existe un producto registrado con ese nombre')),
        },
      },
    },

    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Ver un producto',
        parameters: [idParam],
        responses: {
          200: successEnvelope({ $ref: '#/components/schemas/Product' }),
          400: badRequest('id con formato invalido', badId()),
          404: notFound('no existe un producto con ese id', errorExample('NOT_FOUND', 'No encontramos ese producto en el catalogo de ShipNow Peru')),
        },
      },
      put: {
        tags: ['Products'],
        summary: 'Actualizar un producto (acepta cualquier subconjunto de campos; status se recalcula solo si mandas stock)',
        parameters: [idParam],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  price: { type: 'number', minimum: 0 },
                  stock: { type: 'number', minimum: 0 },
                  city: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: successEnvelope({ $ref: '#/components/schemas/Product' }),
          400: badRequestMulti('id invalido o price/stock negativo', {
            idInvalido: { summary: 'id con formato invalido', value: badId() },
            precioInvalido: { summary: 'price negativo', value: errorExample('VALIDATION_ERROR', 'El precio tiene que ser un numero mayor o igual a cero') },
          }),
          404: notFound('no existe un producto con ese id', errorExample('NOT_FOUND', 'No encontramos ese producto en el catalogo de ShipNow Peru')),
          409: conflict('el producto ya esta discontinuado', errorExample('CONFLICT', 'Un producto discontinuado ya no se puede modificar')),
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Discontinuar un producto (no borra el documento, solo cambia el status)',
        parameters: [idParam],
        responses: {
          200: successEnvelope({ $ref: '#/components/schemas/Product' }),
          400: badRequest('id con formato invalido', badId()),
          404: notFound('no existe un producto con ese id', errorExample('NOT_FOUND', 'No encontramos ese producto en el catalogo de ShipNow Peru')),
          409: conflict('ya estaba discontinuado', errorExample('CONFLICT', 'Este producto ya esta discontinuado')),
        },
      },
    },

    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Listar usuarios activos',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          { name: 'city', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: successEnvelope(paginatedPayload('#/components/schemas/User')),
          400: badRequest('page/limit invalidos', errorExample('VALIDATION_ERROR', 'El parametro "page" tiene que ser un numero entero mayor a cero, recibimos "-1"')),
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Registrar un usuario (siempre queda con rol cliente)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'city'],
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  city: { type: 'string' },
                },
              },
              example: { firstName: 'Maria', lastName: 'Quispe', email: 'maria@mail.com', city: 'Cusco' },
            },
          },
        },
        responses: {
          201: successEnvelope({ $ref: '#/components/schemas/User' }),
          400: badRequestMulti('falta un campo, o el email no tiene formato valido', {
            faltanDatos: { summary: 'falta un campo', value: errorExample('VALIDATION_ERROR', 'Faltan datos obligatorios del usuario') },
            emailInvalido: { summary: 'email mal formado', value: errorExample('VALIDATION_ERROR', 'El correo no tiene un formato valido') },
          }),
          409: conflict('ya existe un usuario con ese correo', errorExample('CONFLICT', 'Ya existe un usuario registrado con ese correo')),
        },
      },
    },

    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Ver un usuario',
        parameters: [idParam],
        responses: {
          200: successEnvelope({ $ref: '#/components/schemas/User' }),
          400: badRequest('id con formato invalido', badId()),
          404: notFound('no existe un usuario con ese id', errorExample('NOT_FOUND', 'No encontramos ese usuario en ShipNow Peru')),
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Actualizar datos de un usuario (role e isActive no se tocan por esta via)',
        parameters: [idParam],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  city: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: successEnvelope({ $ref: '#/components/schemas/User' }),
          400: badRequestMulti('id invalido o email mal formado', {
            idInvalido: { summary: 'id con formato invalido', value: badId() },
            emailInvalido: { summary: 'email mal formado', value: errorExample('VALIDATION_ERROR', 'El correo no tiene un formato valido') },
          }),
          404: notFound('no existe un usuario con ese id', errorExample('NOT_FOUND', 'No encontramos ese usuario en ShipNow Peru')),
          409: conflict('ya existe otro usuario con ese correo', errorExample('CONFLICT', 'Ya existe un usuario registrado con ese correo')),
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Desactivar un usuario (baja logica, no borra el documento)',
        parameters: [idParam],
        responses: {
          200: successEnvelope({ $ref: '#/components/schemas/User' }),
          400: badRequest('id con formato invalido', badId()),
          404: notFound('no existe un usuario con ese id', errorExample('NOT_FOUND', 'No encontramos ese usuario en ShipNow Peru')),
        },
      },
    },

    '/users/{id}/documents': {
      post: {
        tags: ['Users'],
        summary: 'Subir un documento del usuario (DNI, licencia, comprobante de domicilio)',
        description: 'multipart/form-data: el campo del archivo se llama "document" y es obligatorio, junto con "documentType".',
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['document', 'documentType'],
                properties: {
                  document: { type: 'string', format: 'binary', description: 'jpg, png o pdf, hasta 5MB' },
                  documentType: { type: 'string', enum: ['dni', 'licencia_de_conducir', 'comprobante_domicilio'] },
                },
              },
            },
          },
        },
        responses: {
          201: successEnvelope({ $ref: '#/components/schemas/User' }, undefined, 'documento cargado, devuelve el usuario con su array de documents actualizado'),
          400: badRequestMulti('falta el archivo, el tipo de documento no es valido, el archivo no es jpg/png/pdf, o supera los 5MB', {
            archivoFaltante: { summary: 'no se mando ningun archivo', value: errorExample('FILE_REQUIRED', 'Falta subir un archivo en el campo "document"') },
            tipoDocumentoInvalido: { summary: 'documentType fuera del enum', value: errorExample('INVALID_DOCUMENT_TYPE', 'El tipo de documento "pasaporte" no es valido. Usa uno de: dni, licencia_de_conducir, comprobante_domicilio.') },
            tipoArchivoInvalido: { summary: 'mimetype no permitido', value: errorExample('INVALID_FILE_TYPE', 'El tipo de archivo "application/zip" no esta permitido. Usa uno de: image/jpeg, image/png, application/pdf.') },
            archivoMuyGrande: { summary: 'supera los 5MB', value: errorExample('FILE_TOO_LARGE', 'El archivo supera el tamaño maximo permitido (5MB)') },
          }),
          404: notFound('no existe un usuario con ese id', errorExample('NOT_FOUND', 'No encontramos ese usuario en ShipNow Peru')),
        },
      },
    },

    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Listar pedidos',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'] } },
          { name: 'city', in: 'query', schema: { type: 'string' }, description: 'filtra por destinationCity' },
        ],
        responses: {
          200: successEnvelope(paginatedPayload('#/components/schemas/Order')),
          400: badRequestMulti('page/limit invalidos, o status fuera del enum', {
            estadoInvalido: {
              summary: 'status fuera del enum',
              value: errorExample('INVALID_STATUS', 'El estado "volando" no es valido. Usa uno de: pending, confirmed, in_transit, delivered, cancelled.'),
            },
            paginacionInvalida: {
              summary: 'page no numerico',
              value: errorExample('VALIDATION_ERROR', 'El parametro "page" tiene que ser un numero entero mayor a cero, recibimos "abc"'),
            },
          }),
        },
      },
      post: {
        tags: ['Orders'],
        summary: 'Crear un pedido (el cliente tiene que existir)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customer', 'items', 'destinationCity'],
                properties: {
                  customer: { type: 'string', description: 'id de un usuario ya registrado' },
                  items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' }, minItems: 1 },
                  destinationCity: { type: 'string' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'default medium' },
                },
              },
              example: {
                customer: '665f28f19c1d4e5f6a7b8c91',
                items: [{ name: 'Chompa de alpaca', quantity: 2, unitPrice: 89.9 }],
                destinationCity: 'Lima',
                priority: 'high',
              },
            },
          },
        },
        responses: {
          201: successEnvelope({ $ref: '#/components/schemas/Order' }),
          400: badRequestMulti('faltan datos, no hay items, o la prioridad no es valida', {
            sinItems: { summary: 'sin items', value: errorExample('VALIDATION_ERROR', 'El pedido necesita al menos un item valido (name, quantity > 0, unitPrice >= 0)') },
            faltanDatos: { summary: 'falta customer/destinationCity', value: errorExample('VALIDATION_ERROR', 'Faltan datos obligatorios del pedido (customer, destinationCity)') },
          }),
          404: notFound('el customer indicado no existe', errorExample('NOT_FOUND', 'El cliente indicado no existe (o esta desactivado)')),
        },
      },
    },

    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Ver un pedido por id',
        parameters: [idParam],
        responses: {
          200: successEnvelope({ $ref: '#/components/schemas/Order' }),
          400: badRequest('id con formato invalido', badId()),
          404: notFound('no existe un pedido con ese id', errorExample('NOT_FOUND', 'No encontramos ese pedido en ShipNow Peru')),
        },
      },
    },

    '/orders/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Cambiar el estado de un pedido',
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'] } } },
              example: { status: 'confirmed' },
            },
          },
        },
        responses: {
          200: successEnvelope({ $ref: '#/components/schemas/Order' }),
          400: badRequest('status fuera del enum', errorExample('INVALID_STATUS', 'El estado "volando" no es valido. Usa uno de: pending, confirmed, in_transit, delivered, cancelled.')),
          404: notFound('no existe un pedido con ese id', errorExample('NOT_FOUND', 'No encontramos ese pedido en ShipNow Peru')),
          409: conflict('el pedido ya esta cancelado', errorExample('CONFLICT', 'Un pedido cancelado no admite mas cambios de estado')),
        },
      },
    },

    '/orders/{id}/receipt': {
      post: {
        tags: ['Orders'],
        summary: 'Subir el comprobante de un pedido (foto o PDF)',
        description: 'multipart/form-data: el campo del archivo se llama "receipt" y es obligatorio. No pide un tipo de documento.',
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['receipt'],
                properties: { receipt: { type: 'string', format: 'binary', description: 'jpg, png o pdf, hasta 5MB' } },
              },
            },
          },
        },
        responses: {
          201: successEnvelope({ $ref: '#/components/schemas/Order' }, undefined, 'comprobante cargado, devuelve el pedido con su array de receipts actualizado'),
          400: badRequestMulti('falta el archivo, no es jpg/png/pdf, o supera los 5MB', {
            archivoFaltante: { summary: 'no se mando ningun archivo', value: errorExample('FILE_REQUIRED', 'Falta subir un archivo en el campo "receipt"') },
            tipoArchivoInvalido: { summary: 'mimetype no permitido', value: errorExample('INVALID_FILE_TYPE', 'El tipo de archivo "application/zip" no esta permitido. Usa uno de: image/jpeg, image/png, application/pdf.') },
            archivoMuyGrande: { summary: 'supera los 5MB', value: errorExample('FILE_TOO_LARGE', 'El archivo supera el tamaño maximo permitido (5MB)') },
          }),
          404: notFound('no existe un pedido con ese id', errorExample('NOT_FOUND', 'No encontramos ese pedido en ShipNow Peru')),
        },
      },
    },

    '/mocks/users': {
      get: {
        tags: ['Mocks', 'Users'],
        summary: 'Generar usuarios simulados (cliente o repartidor al azar) sin guardarlos',
        parameters: [qtyParam],
        responses: {
          200: successEnvelope({ type: 'array', items: { $ref: '#/components/schemas/UserPreview' } }),
          400: badRequest('qty invalido', errorExample('INVALID_MOCK_QUANTITY', 'La cantidad "-5" no es valida: qty tiene que ser un numero entero mayor a cero')),
        },
      },
    },

    '/mocks/repartidores': {
      get: {
        tags: ['Mocks', 'Users'],
        summary: 'Generar usuarios simulados, todos con rol repartidor, sin guardarlos',
        parameters: [qtyParam],
        responses: {
          200: successEnvelope({ type: 'array', items: { $ref: '#/components/schemas/UserPreview' } }),
          400: badRequest('qty invalido', errorExample('INVALID_MOCK_QUANTITY', 'La cantidad "abc" no es valida: qty tiene que ser un numero entero mayor a cero')),
        },
      },
    },

    '/mocks/pedidos': {
      get: {
        tags: ['Mocks', 'Orders'],
        summary: 'Generar pedidos simulados (con su cliente embebido) sin guardarlos',
        parameters: [qtyParam],
        responses: {
          200: successEnvelope({ type: 'array', items: { $ref: '#/components/schemas/Order' } }),
          400: badRequest('qty invalido', errorExample('INVALID_MOCK_QUANTITY', 'La cantidad "0" no es valida: qty tiene que ser un numero entero mayor a cero')),
        },
      },
    },

    '/mocks/entregas': {
      get: {
        tags: ['Mocks', 'Deliveries'],
        summary: 'Generar entregas simuladas (con su pedido y, si corresponde, su repartidor) sin guardarlas',
        parameters: [qtyParam],
        responses: {
          200: successEnvelope({ type: 'array', items: { $ref: '#/components/schemas/Delivery' } }),
          400: badRequest('qty invalido', errorExample('INVALID_MOCK_QUANTITY', 'La cantidad "-1" no es valida: qty tiene que ser un numero entero mayor a cero')),
        },
      },
    },

    '/mocks/seed': {
      post: {
        tags: ['Mocks'],
        summary: 'Insertar datos de prueba reales en MongoDB',
        description:
          'Si falta "coleccion" asume usuarios. Si pedis pedidos/entregas y no hay suficientes clientes/repartidores/pedidos ' +
          'cargados, crea los que faltan antes para no dejar referencias rotas (ver README, seccion Modulo de mocking).',
        parameters: [
          qtyParam,
          {
            name: 'coleccion',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['usuarios', 'repartidores', 'pedidos', 'entregas'], default: 'usuarios' },
          },
        ],
        responses: {
          201: successEnvelope({ $ref: '#/components/schemas/SeedResult' }),
          400: badRequestMulti('qty invalido, coleccion invalida, o ambos a la vez', {
            cantidadInvalida: {
              summary: 'solo qty esta mal',
              value: errorExample('INVALID_MOCK_QUANTITY', 'La cantidad "-5" no es valida: qty tiene que ser un numero entero mayor a cero'),
            },
            coleccionInvalida: {
              summary: 'solo coleccion esta mal',
              value: errorExample('INVALID_MOCK_COLLECTION', 'La coleccion "invalida" no es valida. Usa una de: usuarios, repartidores, pedidos, entregas.'),
            },
            ambosInvalidos: {
              summary: 'los dos a la vez: se informan juntos en "details"',
              value: errorExample('VALIDATION_ERROR', 'Hay mas de un dato invalido en la peticion de seed', [
                'La coleccion "invalida" no es valida. Usa una de: usuarios, repartidores, pedidos, entregas.',
                'La cantidad "-5" no es valida: qty tiene que ser un numero entero mayor a cero',
              ]),
            },
          }),
          500: serverError('fallo la escritura en MongoDB', errorExample('MOCK_SEED_FAILED', 'No se pudo cargar la coleccion "usuarios" en MongoDB: connection timed out')),
        },
      },
    },

    '/logs/test': {
      get: {
        tags: ['Logger'],
        summary: 'Disparar un log de cada nivel (debug/http/info/warning/error/fatal)',
        description:
          'Herramienta de diagnostico interna para chequear que Winston esta bien configurado (consola + logs/error-*.log). ' +
          'No es una funcionalidad de negocio de ShipNow.',
        responses: {
          200: successEnvelope(
            { type: 'object', properties: { message: { type: 'string' } } },
            { message: 'se generaron logs de los 6 niveles (debug, http, info, warning, error, fatal)' }
          ),
        },
      },
    },
  },
};
