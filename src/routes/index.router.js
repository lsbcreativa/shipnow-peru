import { Router } from 'express';
import productRoutes from './product.routes.js';
import userRoutes from './user.routes.js';
import orderRoutes from './order.routes.js';
import mockRoutes from './mock.routes.js';
import logTestRoutes from './log-test.routes.js';
import docsRoutes from './docs.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'ShipNow Peru esta en linea' });
});

router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);
router.use('/mocks', mockRoutes);
router.use('/logs', logTestRoutes);
router.use('/docs', docsRoutes);

export default router;
