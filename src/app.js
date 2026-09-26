const express = require('express');
const cors = require('cors');
const { getConfig } = require('./config/configuration');
const { getPrisma } = require('./prisma/client');
const { AuthService } = require('./auth/services/auth.service');
const { createAuthRouter } = require('./auth/auth.routes');
const { createLandingRouter } = require('./landing/landing.routes');
const { HttpError, notFound, errorHandler } = require('./middleware/errors');

function createApp({ config = getConfig(), prisma, authService } = {}) {
  const app = express();
  app.disable('x-powered-by');
  const allowedOrigins = new Set(
    [
      config.corsOrigin,
      'http://localhost:3000',
      'https://livewheel-frontend.vercel.app',
    ]
      .filter(Boolean)
      .map((origin) => origin.replace(/\/$/, '')),
  );
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin.replace(/\/$/, '')))
          return callback(null, true);
        callback(new HttpError(403, 'Origin is not allowed by CORS'));
      },
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  const database = () => prisma || getPrisma(config.databaseUrl);
  let service = authService;
  app.use('/api/v1/landing', createLandingRouter(database));
  app.use(
    '/api/v1/auth',
    createAuthRouter(() => {
      if (!service) service = new AuthService(database(), config);
      return service;
    }, config),
  );
  app.get('/api/v1/health', async (req, res) => {
    try {
      await database().$queryRaw`SELECT 1`;
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    } catch {
      res
        .status(503)
        .json({ status: 'error', timestamp: new Date().toISOString() });
    }
  });
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

// Vercel imports this Express app; local startup lives in server.js.
module.exports = createApp();
module.exports.createApp = createApp;
