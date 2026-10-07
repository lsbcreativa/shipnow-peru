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

const logsDir = path.join(process.cwd(), 'logs');

export const logger = winston.createLogger({
  levels,
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(timestamp, winston.format.colorize({ all: true }), lineFormat),
    }),
    new DailyRotateFile({
      dirname: logsDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      level: 'error',
      format: winston.format.combine(timestamp, lineFormat),
    }),
  ],
});
