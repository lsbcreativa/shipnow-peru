import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { config } from './env.config.js';

const levels = { fatal: 0, error: 1, warning: 2, info: 3, http: 4, debug: 5 };

winston.addColors({
  fatal: 'bold red',
  error: 'red',
  warning: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
});

const lineFormat = winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`);

const timestamp = winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' });
const fileFormat = winston.format.combine(timestamp, lineFormat);

const logsDir = path.join(process.cwd(), 'logs');

// error-*.log solo guarda error/fatal; combined-*.log guarda todo lo que ese
// entorno tiene habilitado (debug+ en dev, info+ en produccion, o lo que
// fuerce LOG_LEVEL). Las dos rotan por dia y se quedan 14 dias.
const transports = [
  new DailyRotateFile({
    dirname: logsDir,
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    level: 'error',
    format: fileFormat,
  }),
  new DailyRotateFile({
    dirname: logsDir,
    filename: 'combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    format: fileFormat,
  }),
];

// consola solo en desarrollo -- en produccion (y en los tests) el detalle
// queda en los archivos, no hace falta ensuciar la salida del proceso
if (config.nodeEnv === 'development') {
  transports.unshift(
    new winston.transports.Console({
      format: winston.format.combine(timestamp, winston.format.colorize({ all: true }), lineFormat),
    })
  );
}

export const logger = winston.createLogger({
  levels,
  level: config.logLevel || (config.nodeEnv === 'production' ? 'info' : 'debug'),
  transports,
});
