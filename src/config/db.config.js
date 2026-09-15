import mongoose from 'mongoose';
import { config } from './env.config.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Conexion a MongoDB establecida correctamente');
  } catch (error) {
    console.error('No se pudo conectar a MongoDB:', error.message);
    process.exit(1);
  }
};
