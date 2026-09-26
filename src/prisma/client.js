const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { HttpError } = require('../middleware/errors');

let client;
function getPrisma(databaseUrl) {
  if (!databaseUrl) throw new HttpError(503, 'Database is not configured.');
  if (!client) {
    client = new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl }),
    });
  }
  return client;
}
async function disconnectPrisma() {
  if (client) await client.$disconnect();
}
module.exports = { getPrisma, disconnectPrisma };
