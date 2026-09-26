const { Router } = require('express');
const { landingTables } = require('./landing.tables');
const { getLandingSection } = require('./landing.service');

function createLandingRouter(getDatabase) {
  const router = Router();
  for (const table of landingTables) {
    router.get(`/${table.slug}`, async (req, res) => {
      res.set('Cache-Control', 'no-store');
      res.json(await getLandingSection(getDatabase(), table));
    });
  }
  return router;
}
module.exports = { createLandingRouter };
