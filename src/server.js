const app = require('./app');
const { getConfig } = require('./config/configuration');
const { disconnectPrisma } = require('./prisma/client');

const { port } = getConfig();
const server = app.listen(port, () =>
  console.log(`API running on http://localhost:${port}/api/v1`),
);
async function shutdown() {
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
