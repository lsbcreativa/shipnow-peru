import { Router } from 'express';
import { listOrders, getOrder, createOrder, updateOrderStatus } from '../controllers/order.controller.js';

const router = Router();

router.get('/', listOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);

export default router;
