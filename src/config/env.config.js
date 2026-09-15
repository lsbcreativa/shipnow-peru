import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_VARS = ['PORT', 'MONGODB_URI', 'NODE_ENV'];

const missingVars = REQUIRED_VARS.filter((key) => !process.env[key] || process.env[key].trim() === '');

if (missingVars.length > 0) {
  throw new Error(
    `Faltan variables de entorno obligatorias: ${missingVars.join(', ')}. ` +
      'Revisa tu archivo .env (guiate con .env.example) antes de levantar ShipNow Peru.'
  );
}

if (Number.isNaN(Number(process.env.PORT))) {
  throw new Error('La variable de entorno PORT tiene que ser un numero valido.');
}

export const config = Object.freeze({
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV,
});
