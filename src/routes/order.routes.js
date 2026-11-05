import { Router } from 'express';
import { listOrders, getOrder, createOrder, updateOrderStatus, uploadOrderReceipt } from '../controllers/order.controller.js';
import { orderReceiptUpload } from '../config/upload.config.js';

const router = Router();

router.get('/', listOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);
router.post('/:id/receipt', orderReceiptUpload, uploadOrderReceipt);

export default router;
