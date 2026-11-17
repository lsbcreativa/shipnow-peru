import { Router } from 'express';
import { listUsers, getUser, createUser, updateUser, deleteUser, uploadUserDocument } from '../controllers/user.controller.js';
import { userDocumentUpload } from '../config/upload.config.js';
import { validateObjectIdParam } from '../middlewares/validate-object-id.middleware.js';

const router = Router();

router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/documents', validateObjectIdParam('id'), userDocumentUpload, uploadUserDocument);

export default router;
