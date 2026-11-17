import { Router } from 'express';
import { listOrders, getOrder, createOrder, updateOrderStatus, uploadOrderReceipt } from '../controllers/order.controller.js';
import { orderReceiptUpload } from '../config/upload.config.js';
import { validateObjectIdParam } from '../middlewares/validate-object-id.middleware.js';

const router = Router();

router.get('/', listOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);
router.post('/:id/receipt', validateObjectIdParam('id'), orderReceiptUpload, uploadOrderReceipt);

export default router;
