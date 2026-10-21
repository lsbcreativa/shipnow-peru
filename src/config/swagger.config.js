import { config } from './env.config.js';

// Spec de OpenAPI escrito a mano (sin swagger-jsdoc), separado a proposito de
// src/routes/ para no mezclar la doc con la logica de las rutas. Las rutas no
// saben que esto existe; esto no sabe nada de express.

const errorResponseExample = (code, message, details) => ({
  status: 'error',
  code,
  message,
  ...(details ? { details } : {}),
});

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
      'Pedido tal cual lo devuelve el generador de mocks (GET /mocks/pedidos). No hay un endpoint que devuelva un pedido ya ' +
      'guardado en Mongo; ahi "customer" queda como un id de referencia en vez del objeto de usuario embebido que se ve aca.',
    properties: {
      customer: { $ref: '#/components/schemas/UserPreview' },
      items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
      totalAmount: { type: 'number', example: 184.72 },
      destinationCity: { type: 'string', example: 'Arequipa' },
      status: {
        type: 'string',
        enum: ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'],
        example: 'confirmed',
      },
      priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
    },
  },

  Delivery: {
    type: 'object',
    description: 'Entrega tal cual la devuelve GET /mocks/entregas, con su pedido embebido (mismo motivo que Order).',
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
          'INTERNAL_ERROR',
        ],
      },
      message: { type: 'string' },
      details: { type: 'array', items: { type: 'string' }, description: 'solo aparece en algunos VALIDATION_ERROR' },
    },
  },
};

const responses = {
  BadRequest: {
    description: 'Dato invalido (falta un campo, formato incorrecto, qty/coleccion/status invalidos, body con JSON mal formado)',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: errorResponseExample('VALIDATION_ERROR', 'Faltan datos obligatorios del producto'),
      },
    },
  },
  NotFound: {
    description: 'El recurso pedido no existe',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: errorResponseExample('NOT_FOUND', 'No encontramos ese producto en el catalogo de ShipNow Peru'),
      },
    },
  },
  Conflict: {
    description: 'Conflicto con el estado actual del recurso (duplicado, ya discontinuado, etc.)',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: errorResponseExample('CONFLICT', 'Ya existe un usuario registrado con ese correo'),
      },
    },
  },
  ServerError: {
    description: 'Fallo inesperado del servidor o de la carga en MongoDB',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: errorResponseExample('INTERNAL_ERROR', 'Ocurrio un error inesperado en el servidor'),
      },
    },
  },
};

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

const successEnvelope = (payloadSchema, example) => ({
  description: 'OK',
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
    { name: 'Products', description: 'Catalogo de productos' },
    { name: 'Users', description: 'Usuarios de la plataforma (clientes y repartidores)' },
    { name: 'Orders', description: 'Pedidos. Hoy solo existen via el modulo de mocks, no hay un CRUD real todavia' },
    { name: 'Deliveries', description: 'Entregas. Igual que Orders, por ahora solo via mocks' },
    { name: 'Mocks', description: 'Generacion y carga de datos de prueba (usuarios, repartidores, pedidos, entregas)' },
    { name: 'Logger', description: 'Endpoint de diagnostico del sistema de logs, no es logica de negocio' },
  ],
  components: { schemas, responses },
  paths: {
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
          400: responses.BadRequest,
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
          400: responses.BadRequest,
          409: responses.Conflict,
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
          400: responses.BadRequest,
          404: responses.NotFound,
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
          400: responses.BadRequest,
          404: responses.NotFound,
          409: responses.Conflict,
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Discontinuar un producto (no borra el documento, solo cambia el status)',
        parameters: [idParam],
        responses: {
          200: successEnvelope({ $ref: '#/components/schemas/Product' }),
          404: responses.NotFound,
          409: responses.Conflict,
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
          400: responses.BadRequest,
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
          400: responses.BadRequest,
          409: responses.Conflict,
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
          400: responses.BadRequest,
          404: responses.NotFound,
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
          400: responses.BadRequest,
          404: responses.NotFound,
          409: responses.Conflict,
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Desactivar un usuario (baja logica, no borra el documento)',
        parameters: [idParam],
        responses: {
          200: successEnvelope({ $ref: '#/components/schemas/User' }),
          404: responses.NotFound,
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
          400: responses.BadRequest,
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
          400: responses.BadRequest,
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
          400: responses.BadRequest,
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
          400: responses.BadRequest,
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
          400: {
            description: 'qty invalido, coleccion invalida, o ambos a la vez (en ese caso los dos se informan juntos en "details")',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: errorResponseExample(
                  'VALIDATION_ERROR',
                  'Hay mas de un dato invalido en la peticion de seed',
                  [
                    'La coleccion "invalida" no es valida. Usa una de: usuarios, repartidores, pedidos, entregas.',
                    'La cantidad "-5" no es valida: qty tiene que ser un numero entero mayor a cero',
                  ]
                ),
              },
            },
          },
          500: responses.ServerError,
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
