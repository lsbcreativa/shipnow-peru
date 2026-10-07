import mongoose from 'mongoose';
import { config } from './env.config.js';
import { logger } from './logger.config.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Conexion a MongoDB establecida correctamente');
  } catch (error) {
    logger.fatal(`No se pudo conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};
