const app = require('./app');
const { validateEnv } = require('./config/env');
const logger = require('./utils/logger');

validateEnv();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Lalaland Cafe API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// Graceful shutdown for orchestrated environments (Docker/K8s)
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});

module.exports = server;
