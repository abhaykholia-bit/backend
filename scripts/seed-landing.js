const { getConfig } = require('../src/config/configuration');
const { getPrisma, disconnectPrisma } = require('../src/prisma/client');
const { landingSections } = require('../src/landing/landing.data');
const { landingTables } = require('../src/landing/landing.tables');

// Insert missing design records; repeated seeds preserve edits already made in DB.
async function seedLanding(database) {
  await database.$transaction(
    async (tx) => {
      for (const table of landingTables) {
        const { items, ...section } = landingSections[table.slug];
        await tx[table.model].upsert({
          where: { id: section.id },
          create: section,
          update: {},
        });
        if (table.itemModel) {
          for (const [sortOrder, item] of items.entries()) {
            await tx[table.itemModel].upsert({
              where: { id: item.id },
              create: { ...item, sectionId: section.id, sortOrder },
              update: {},
            });
          }
        }
      }
    },
    { maxWait: 10000, timeout: 60000 },
  );
}

if (require.main === module) {
  (async () => {
    try {
      await seedLanding(getPrisma(getConfig().databaseUrl));
      console.log(
        'Landing content seeded: 10 sections and 35 items. Existing records preserved.',
      );
    } catch (error) {
      console.error('Landing seed failed:', error.code || error.name);
      process.exitCode = 1;
    } finally {
      await disconnectPrisma();
    }
  })();
}
module.exports = { seedLanding };
