import { Router } from 'express';
import {
  mockUsers,
  mockRepartidores,
  mockOrders,
  mockDeliveries,
  seedMocks,
} from '../controllers/mock.controller.js';

const router = Router();

router.get('/users', mockUsers);
router.get('/repartidores', mockRepartidores);
router.get('/pedidos', mockOrders);
router.get('/entregas', mockDeliveries);
router.post('/seed', seedMocks);

export default router;
