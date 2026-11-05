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

export class FileRequiredError extends AppError {
  constructor(fieldName) {
    super(ERROR_CODES.FILE_REQUIRED, `Falta subir un archivo en el campo "${fieldName}"`);
  }
}

export class InvalidFileTypeError extends AppError {
  constructor(mimeType, allowedTypes) {
    super(
      ERROR_CODES.INVALID_FILE_TYPE,
      `El tipo de archivo "${mimeType}" no esta permitido. Usa uno de: ${allowedTypes.join(', ')}.`
    );
  }
}

export class FileTooLargeError extends AppError {
  constructor(maxBytes) {
    super(ERROR_CODES.FILE_TOO_LARGE, `El archivo supera el tamaño maximo permitido (${Math.round(maxBytes / (1024 * 1024))}MB)`);
  }
}

export class InvalidDocumentTypeError extends AppError {
  constructor(documentType, validTypes) {
    super(
      ERROR_CODES.INVALID_DOCUMENT_TYPE,
      `El tipo de documento "${documentType}" no es valido. Usa uno de: ${validTypes.join(', ')}.`
    );
  }
}

export class FileStorageError extends AppError {
  constructor(originalError) {
    super(ERROR_CODES.FILE_STORAGE_FAILED, `No se pudo guardar el archivo: ${originalError.message}`);
  }
}
