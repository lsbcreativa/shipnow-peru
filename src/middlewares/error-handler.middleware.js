import { AppError, ERROR_CODES } from '../errors/index.js';
import { ValidationError, ConflictError } from '../errors/domain-errors.js';
import { logger } from '../config/logger.config.js';

// Traduce fallas que no son nuestras (Mongoose, body-parser) a un AppError,
// para que el resto de esta funcion sea uniforme sin importar de donde vino el error.
const translateKnownDriverError = (error) => {
  if (error.type === 'entity.parse.failed') {
    return new ValidationError('El body de la peticion no es un JSON valido');
  }

  if (error.name === 'ValidationError' && error.errors) {
    const details = Object.values(error.errors).map((fieldError) => fieldError.message);
    return new ValidationError('Los datos enviados no cumplen con el esquema esperado', details);
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'campo';
    return new ConflictError(`Ya existe un registro con ese valor en "${field}"`);
  }

  if (error.name === 'CastError') {
    return new ValidationError(`El valor "${error.value}" no tiene un formato valido para "${error.path}"`);
  }

  return null;
};

// Unico lugar de todo el proyecto que arma una respuesta de error.
// Todo lo demas lanza un AppError (o deja pasar el error del driver) y llama a next(error).
export const errorHandlerMiddleware = (error, req, res, next) => {
  const knownError = error instanceof AppError ? error : translateKnownDriverError(error);
  const finalError = knownError || new AppError(ERROR_CODES.INTERNAL_ERROR);

  if (finalError.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${finalError.message}`);
    if (!knownError) logger.error(error.stack);
  } else {
    logger.warning(`${req.method} ${req.originalUrl} -> ${finalError.message}`);
  }

  res.status(finalError.statusCode).json({
    status: 'error',
    code: finalError.code,
    message: finalError.message,
    ...(finalError.details ? { details: finalError.details } : {}),
  });
};
