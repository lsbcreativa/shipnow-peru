import { ValidationError } from '../errors/index.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const isPresent = (value) => value !== undefined && value !== null && value !== '';

export const parsePagination = ({ page, limit } = {}) => {
  let parsedPage = DEFAULT_PAGE;
  if (isPresent(page)) {
    parsedPage = Number(page);
    if (!Number.isInteger(parsedPage) || parsedPage <= 0) {
      throw new ValidationError(`El parametro "page" tiene que ser un numero entero mayor a cero, recibimos "${page}"`);
    }
  }

  let parsedLimit = DEFAULT_LIMIT;
  if (isPresent(limit)) {
    parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
      throw new ValidationError(`El parametro "limit" tiene que ser un numero entero mayor a cero, recibimos "${limit}"`);
    }
    parsedLimit = Math.min(parsedLimit, MAX_LIMIT);
  }

  return { page: parsedPage, limit: parsedLimit };
};
