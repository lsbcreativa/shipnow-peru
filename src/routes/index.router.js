import { Router } from 'express';
import productRoutes from './product.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'ShipNow Peru esta en linea' });
});

router.use('/products', productRoutes);
router.use('/users', userRoutes);

export default router;
