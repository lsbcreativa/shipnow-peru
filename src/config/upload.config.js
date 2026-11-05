import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { InvalidFileTypeError } from '../errors/index.js';

// todo lo que tiene que ver con donde/como se guardan los archivos vive aca,
// no en los routers. los routers solo importan el middleware ya armado.

export const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const buildStorage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(UPLOADS_ROOT, subfolder, req.params.id || 'sin-id');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
    },
  });

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(new InvalidFileTypeError(file.mimetype, ALLOWED_FILE_TYPES));
  }
  cb(null, true);
};

export const userDocumentUpload = multer({
  storage: buildStorage('users'),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('document');

export const orderReceiptUpload = multer({
  storage: buildStorage('orders'),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('receipt');

// ruta relativa al proyecto para guardar en Mongo, asi la API no expone la
// estructura de carpetas absoluta del servidor en cada respuesta
export const relativeUploadPath = (absolutePath) => path.relative(process.cwd(), absolutePath).split(path.sep).join('/');
