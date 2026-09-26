# LifeWheel backend

A Node.js + Express API written in plain JavaScript. There is no NestJS,
TypeScript compilation, or `dist` entrypoint. PostgreSQL and Prisma keep the
existing database schema and migrations.

## Run locally

Use Node.js 22.12+ or Node.js 24.

```sh
npm install
npm run prisma:generate
npm run start:dev
```

For a new local setup, copy `.env.example` to `.env` and supply your own values.
Existing `.env.development` / `.env.production` files are supported. Platform
variables override files; the environment-specific file takes precedence over
`.env`. Do not commit credentials.

Base URL: `http://localhost:4000/api/v1`

- `npm start`: start the API with Node.js.
- `npm run start:dev`: restart on changes with Node's built-in watch mode.
- `npm run build`: generate the Prisma JavaScript client and check JS syntax.
- `npm test`: HTTP/auth tests with fake database dependencies; no live DB changes.
- `npm run lint`: JavaScript lint checks.

## Files

```text
src/
  app.js                       # Express app, middleware, API mounts, Vercel export
  server.js                    # Local port listener
  auth/auth.routes.js          # OTP, signup, session and logout HTTP routes
  auth/services/auth.service.js
  landing/landing.routes.js    # 10 public landing routes
  landing/landing.data.js      # Initial seed fixture only
  config/configuration.js      # Environment variables
  middleware/errors.js         # JSON error responses
  prisma/client.js             # Reused, lazy Prisma client
prisma.config.js               # Prisma CLI config in JavaScript
prisma/                       # Existing schema and migrations
```

## API compatibility

Existing endpoint URLs and response shapes are retained:

- `GET /api/v1/landing/<section>`: see [landing API docs](docs/landing-api.md)
  and [Postman collection](docs/landing.postman_collection.json).
- `POST /api/v1/auth/request-otp`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/signup`
- `GET /api/v1/auth/session`
- `POST /api/v1/auth/logout`
- `GET /api/v1/health`: checks PostgreSQL (`200` available, `503` unavailable).

Auth POST responses retain HTTP 201. Session cookies remain HttpOnly, with
Secure + SameSite=None in production. CORS allows the configured frontend,
`http://localhost:3000` and `https://livewheel-frontend.vercel.app`.
Landing routes, auth and health now use PostgreSQL through Prisma.

The email sender was already removed before this migration. This conversion
preserves that state: OTPs are generated but not emailed. `OTP_CONSOLE_ENABLED`
controls the existing debug OTP response. Production email delivery still needs
a provider integration; the framework change does not resolve it.

## Vercel

`vercel.json` selects Express with `npm run build`. `src/app.js` exports the app
for Vercel, while `src/server.js` is the local listener. Set the project root to
this backend folder, use Node.js 22 or 24, and remove any old dashboard output
folder override pointing to `dist`. Supply `DATABASE_URL`, `OTP_HASH_SECRET`,
`CORS_ORIGIN`, `NODE_ENV=production` and `OTP_CONSOLE_ENABLED=false` in the project
environment. Keep frontend API URLs unchanged. Redeploy after committing these
changes; this migration does not deploy automatically.

References: [Express on Vercel](https://vercel.com/docs/frameworks/backend/express)
and [Prisma JavaScript configuration](https://docs.prisma.io/docs/orm/reference/prisma-config-reference).

## Separate CMS scaffold

`cms/` remains an independent Strapi app with its own package.json and tooling.
It is not imported or started by this Express API. Its setup is unchanged.

## Landing database content

Run `npm run prisma:deploy` then `npm run seed:landing` for a new database.
The 10 section tables and 8 item tables hold 10 sections and 35 ordered items.
Re-running the seed inserts missing IDs but preserves existing rows and edits.
Edit content with `npm run prisma:studio`; changes appear on the next API request.
`src/landing/landing.data.js` is only a seed fixture and is never imported by live routes.
See [landing database details](docs/landing-database.md).
