# Landing database storage

All ten public endpoints now read PostgreSQL via Prisma. API paths and JSON response shapes are unchanged. There is no static fallback or automatic seed during requests/builds. Each request reads current database content with Cache-Control: no-store.

| Endpoint suffix | Section model/table | Item model/table |
| --- | --- | --- |
| wellness-lounge | LandingWellnessLounge | LandingWellnessLoungeItem |
| holistic-solutions | LandingHolisticSolutions | LandingHolisticSolutionsItem |
| knowledge-hub | LandingKnowledgeHub | LandingKnowledgeHubItem |
| faithkart | LandingFaithkart | LandingFaithkartItem |
| wellness-insights | LandingWellnessInsights | LandingWellnessInsightsItem |
| upcoming-rituals | LandingUpcomingRituals | LandingUpcomingRitualsItem |
| meet-your-master | LandingMeetYourMaster | Banner fields on section row |
| corporate-wellness | LandingCorporateWellness | Banner fields on section row |
| success-stories | LandingSuccessStories | LandingSuccessStoriesItem |
| video-testimonials | LandingVideoTestimonials | LandingVideoTestimonialsItem |

Section IDs match endpoint slugs. Every item has its own ID, sectionId foreign key, sortOrder, createdAt and updatedAt. Reads sort by sortOrder then ID. Ritual benefits use a JSON column; master values use a PostgreSQL string array. Image/icon/video URLs are stored as text. The actual image files remain on the frontend. Missing video URLs remain null.

## Apply to a new environment

Set DATABASE_URL to the intended database, then run:

```sh
npm run prisma:deploy
npm run build
npm run seed:landing
```

Migration: prisma/migrations/20260925120000_landing_sections/migration.sql. It creates 18 tables and their indexes/foreign keys in a transaction, without changing auth tables. The seed inserts 10 sections and 35 items in a separate transaction. Re-running the seed does not duplicate records or overwrite edits. It will reinsert a deleted fixture ID; do not rerun it after intentional deletions unless that is desired.

Production deployment should generate Prisma client with npm run build. Apply migrations/seeding explicitly before deploying the database-reading backend. Runtime env DATABASE_URL must point to the migrated/seeded database.

## Edit content

Run npm run prisma:studio. Edit section titles or item content in their respective tables, and sortOrder to change item order. No backend redeploy is required for database edits. Refresh the homepage to fetch updates. Keep required frontend contract fields populated (for example video testimonial imageUrl and subtitle). An absent section returns 404; database failures do not return seed data.

The seed fixture remains in src/landing/landing.data.js only for initializing a new database. Editing it does not change live content. There is no public write endpoint; this change supplies database storage and public reads.
