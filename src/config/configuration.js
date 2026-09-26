const path = require('node:path');
const dotenv = require('dotenv');

// Platform environment variables take priority over local files.
const root = path.resolve(__dirname, '../..');
dotenv.config({
  path: [
    path.join(
      root,
      process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development',
    ),
    path.join(root, '.env'),
  ],
  quiet: true,
});

function getConfig(env = process.env) {
  return {
    port: Number(env.PORT || 4000),
    nodeEnv: env.NODE_ENV || 'development',
    databaseUrl: env.DATABASE_URL,
    corsOrigin:
      env.CORS_ORIGIN ||
      (env.NODE_ENV === 'production'
        ? 'https://livewheel-frontend.vercel.app'
        : 'http://localhost:3000'),
    auth: {
      otpSecret: env.OTP_HASH_SECRET,
      otpConsoleEnabled: env.OTP_CONSOLE_ENABLED === 'true',
    },
  };
}
module.exports = { getConfig };
