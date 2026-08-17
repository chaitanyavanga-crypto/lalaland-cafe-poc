const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const { MulterError } = require('multer');

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  let error = err;

  if (error instanceof MulterError) {
    error = ApiError.badRequest(`Upload failed: ${error.message}`);
  } else if (!(error instanceof ApiError)) {
    // Unexpected errors (DB failures, programming bugs) are logged with
    // full detail but never leaked to the client in production.
    logger.error(err.stack || err.message);
    error = ApiError.internal(
      process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    );
  } else if (error.statusCode >= 500) {
    logger.error(err.stack || err.message);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    details: error.details || undefined,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFoundHandler };
