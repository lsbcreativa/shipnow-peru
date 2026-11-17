import { Router } from 'express';
import productRoutes from './product.routes.js';
import userRoutes from './user.routes.js';
import orderRoutes from './order.routes.js';
import mockRoutes from './mock.routes.js';
import logTestRoutes from './log-test.routes.js';
import docsRoutes from './docs.routes.js';
import { config } from '../config/index.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    environment: config.nodeEnv,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);

// mocks y el endpoint de prueba del logger son herramientas de desarrollo:
// generan datos falsos o ruido de logs a proposito. En produccion no tienen
// ningun valor de negocio y sembrar datos de prueba sobre una base real
// seria directamente peligroso, asi que ni se montan -- caen en el 404
// generico como cualquier ruta que no existe. Swagger si queda disponible
// en todos los entornos: es solo documentacion, no toca datos.
if (config.nodeEnv !== 'production') {
  router.use('/mocks', mockRoutes);
  router.use('/logs', logTestRoutes);
}

router.use('/docs', docsRoutes);

export default router;
