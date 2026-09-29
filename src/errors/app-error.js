import { ERROR_CODES, ERROR_DICTIONARY } from './error-codes.js';

export class AppError extends Error {
  constructor(code, message, details) {
    const entry = ERROR_DICTIONARY[code] ?? ERROR_DICTIONARY[ERROR_CODES.INTERNAL_ERROR];
    super(message || entry.defaultMessage);
    this.code = code in ERROR_DICTIONARY ? code : ERROR_CODES.INTERNAL_ERROR;
    this.statusCode = entry.statusCode;
    this.details = details;
  }
}
