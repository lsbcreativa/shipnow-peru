export const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INVALID_STATUS: 'INVALID_STATUS',
  INVALID_MOCK_QUANTITY: 'INVALID_MOCK_QUANTITY',
  INVALID_MOCK_COLLECTION: 'INVALID_MOCK_COLLECTION',
  MOCK_SEED_FAILED: 'MOCK_SEED_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
});

// Diccionario de errores: cada codigo sabe su status HTTP y su mensaje por defecto.
// Los errores personalizados (src/errors/domain-errors.js) siempre parten de un codigo de aca.
export const ERROR_DICTIONARY = Object.freeze({
  [ERROR_CODES.VALIDATION_ERROR]: {
    statusCode: 400,
    defaultMessage: 'Los datos enviados no son validos',
  },
  [ERROR_CODES.NOT_FOUND]: {
    statusCode: 404,
    defaultMessage: 'El recurso solicitado no existe',
  },
  [ERROR_CODES.CONFLICT]: {
    statusCode: 409,
    defaultMessage: 'La operacion entra en conflicto con el estado actual del recurso',
  },
  [ERROR_CODES.INVALID_STATUS]: {
    statusCode: 400,
    defaultMessage: 'El estado indicado no es valido',
  },
  [ERROR_CODES.INVALID_MOCK_QUANTITY]: {
    statusCode: 400,
    defaultMessage: 'La cantidad (qty) tiene que ser un numero entero mayor a cero',
  },
  [ERROR_CODES.INVALID_MOCK_COLLECTION]: {
    statusCode: 400,
    defaultMessage: 'La coleccion indicada no es valida',
  },
  [ERROR_CODES.MOCK_SEED_FAILED]: {
    statusCode: 500,
    defaultMessage: 'No se pudo completar la carga de datos de prueba en MongoDB',
  },
  [ERROR_CODES.INTERNAL_ERROR]: {
    statusCode: 500,
    defaultMessage: 'Ocurrio un error inesperado en el servidor',
  },
});
