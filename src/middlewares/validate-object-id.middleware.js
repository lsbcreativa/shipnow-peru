import mongoose from 'mongoose';
import { ValidationError } from '../errors/index.js';

// se usa antes de Multer en las rutas de carga de archivos: el id de la url
// se usa para armar la carpeta de destino en disco, asi que tiene que estar
// validado ANTES de que Multer toque el filesystem, no despues (un id como
// "../../../etc" armado a mano podria escribir fuera de uploads/).
export const validateObjectIdParam = (paramName = 'id') => (req, res, next) => {
  const value = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return next(new ValidationError(`El valor "${value}" no tiene un formato valido para "${paramName}"`));
  }
  next();
};
