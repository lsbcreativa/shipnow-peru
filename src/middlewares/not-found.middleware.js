import { NotFoundError } from '../errors/index.js';

export const notFoundMiddleware = (req, res, next) => {
  next(new NotFoundError(`La ruta ${req.originalUrl} no existe`));
};
