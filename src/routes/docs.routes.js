import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger.config.js';

const router = Router();

// el spec crudo, para que algo (los tests, o quien quiera) lo pueda leer sin
// tener que scrapear el HTML de Swagger UI
router.get('/openapi.json', (req, res) => res.json(swaggerSpec));

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec));

export default router;
