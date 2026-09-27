const app = require('./app');
const { getConfig } = require('./config/configuration');
const { disconnectPrisma } = require('./prisma/client');

const { port } = getConfig();
const server = app.listen(port, (error) => {
  if (error) {
    console.error(
      error.code === 'EADDRINUSE'
        ? `Cannot start API: port ${port} is already in use. Stop the existing server or choose another port (for example, PORT=4001 npm start).`
        : `Cannot start API: ${error.message}`,
    );
    process.exitCode = 1;
    return;
  }
  console.log(`API running on http://localhost:${server.address().port}/api/v1`);
});
async function shutdown() {
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
