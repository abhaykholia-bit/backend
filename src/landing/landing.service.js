const { HttpError } = require('../middleware/errors');

function publicFields(record, fields) {
  return Object.fromEntries(
    fields
      .filter((key) => record[key] !== null || key === 'videoUrl')
      .map((key) => [key, record[key]]),
  );
}

async function getLandingSection(database, table) {
  const record = await database[table.model].findUnique({
    where: { id: table.slug },
    ...(table.itemModel
      ? {
          include: {
            items: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
          },
        }
      : {}),
  });
  if (!record)
    throw new HttpError(404, 'Landing section has not been published.');
  const data = publicFields(record, table.sectionFields);
  if (table.itemModel)
    data.items = record.items.map((item) =>
      publicFields(item, table.itemFields),
    );
  return { data };
}
module.exports = { getLandingSection };
