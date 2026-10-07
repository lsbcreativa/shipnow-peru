import { logger } from '../config/logger.config.js';
import { successResponse } from '../utils/http-response.js';

// endpoint de diagnostico, no es logica de negocio: solo sirve para chequear
// a ojo que los 6 niveles del logger salen bien por consola y por archivo.
export const testLogger = (req, res) => {
  logger.debug('log de prueba - nivel debug');
  logger.http('log de prueba - nivel http');
  logger.info('log de prueba - nivel info');
  logger.warning('log de prueba - nivel warning');
  logger.error('log de prueba - nivel error');
  logger.fatal('log de prueba - nivel fatal');

  successResponse(res, 200, {
    message: 'se generaron logs de los 6 niveles (debug, http, info, warning, error, fatal)',
  });
};
