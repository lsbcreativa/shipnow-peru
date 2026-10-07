import { Router } from 'express';
import { testLogger } from '../controllers/log-test.controller.js';

const router = Router();

router.get('/test', testLogger);

export default router;
