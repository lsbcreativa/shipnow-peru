import { AppError } from './app-error.js';
import { ERROR_CODES } from './error-codes.js';

export class NotFoundError extends AppError {
  constructor(message) {
    super(ERROR_CODES.NOT_FOUND, message);
  }
}

export class ValidationError extends AppError {
  constructor(message, details) {
    super(ERROR_CODES.VALIDATION_ERROR, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(ERROR_CODES.CONFLICT, message);
  }
}

export class InvalidStatusError extends AppError {
  constructor(status, validStatuses) {
    super(ERROR_CODES.INVALID_STATUS, `El estado "${status}" no es valido. Usa uno de: ${validStatuses.join(', ')}.`);
  }
}

export class InvalidMockQuantityError extends AppError {
  constructor(qty) {
    super(
      ERROR_CODES.INVALID_MOCK_QUANTITY,
      `La cantidad "${qty}" no es valida: qty tiene que ser un numero entero mayor a cero`
    );
  }
}

export class InvalidMockCollectionError extends AppError {
  constructor(coleccion, validCollections) {
    super(
      ERROR_CODES.INVALID_MOCK_COLLECTION,
      `La coleccion "${coleccion}" no es valida. Usa una de: ${validCollections.join(', ')}.`
    );
  }
}

export class MockSeedError extends AppError {
  constructor(coleccion, originalError) {
    super(
      ERROR_CODES.MOCK_SEED_FAILED,
      `No se pudo cargar la coleccion "${coleccion}" en MongoDB: ${originalError.message}`
    );
  }
}
