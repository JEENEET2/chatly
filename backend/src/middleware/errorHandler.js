import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });

  next();
}

export function errorHandler(err, req, res, next) {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Don't leak error details in production
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: isProduction ? 'An error occurred' : err.message,
    ...(isProduction ? {} : { stack: err.stack })
  });
}
