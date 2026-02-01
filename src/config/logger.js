import winston from 'winston';
import config from './env.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Configure transports based on environment
const transports = [];

// Always add console transport
if (config.env === 'production') {
  // Production: Console only (no colors, no file logging)
  transports.push(
    new winston.transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    })
  );
} else {
  // Development: Console with colors + File logging
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: config.logLevel,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: transports,
});

export default logger;
