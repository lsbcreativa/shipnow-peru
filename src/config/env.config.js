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

const VALID_LOG_LEVELS = ['fatal', 'error', 'warning', 'info', 'http', 'debug'];

if (process.env.LOG_LEVEL && !VALID_LOG_LEVELS.includes(process.env.LOG_LEVEL)) {
  throw new Error(`LOG_LEVEL tiene que ser uno de: ${VALID_LOG_LEVELS.join(', ')}. Recibido: "${process.env.LOG_LEVEL}".`);
}

// LOG_LEVEL es opcional: si no viene, logger.config.js decide el nivel
// segun NODE_ENV (debug en desarrollo, info en produccion). Si viene, gana
// siempre -- sirve para subir temporalmente el detalle en produccion sin
// tocar codigo ni redeployar.
export const config = Object.freeze({
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL || null,
});
