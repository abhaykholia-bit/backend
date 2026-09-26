# Landing section APIs

Local base: `http://localhost:4000/api/v1`
Production base (after deploying these changes): `https://livewheel-backend-liard.vercel.app/api/v1`

All routes are public GET requests. No token, body, or query parameters are required. Success: HTTP 200 with `{ "data": <section> }`. Unknown routes return 404.

| Section | Endpoint |
| --- | --- |
| Wellness Lounge | GET /api/v1/landing/wellness-lounge |
| Holistic Solutions | GET /api/v1/landing/holistic-solutions |
| Knowledge Hub | GET /api/v1/landing/knowledge-hub |
| Faithkart | GET /api/v1/landing/faithkart |
| Wellness Insights | GET /api/v1/landing/wellness-insights |
| Upcoming Ritual | GET /api/v1/landing/upcoming-rituals |
| MEET YOUR MASTER | GET /api/v1/landing/meet-your-master |
| CORPORATE WELLNESS | GET /api/v1/landing/corporate-wellness |
| Our Success Stories | GET /api/v1/landing/success-stories |
| Video Testimonials | GET /api/v1/landing/video-testimonials |

## Postman
Import `landing.postman_collection.json`. Its collection variable `baseUrl` defaults to local; set it to the production base after deployment. Each request includes a saved 200 response example and checks for status/section identity. Do not append /api/v1 twice.

## Curl
```sh
curl -i http://localhost:4000/api/v1/landing/wellness-lounge
```

## Content contract
Each section contains `id`, `title`, and either ordered `items` or banner fields. List entries have stable IDs. Full response examples for all 10 sections are saved in the Postman collection.

- Cards: name, description when applicable, color, image/icon keys for the existing frontend, plus imageUrl/iconUrl paths.
- Courses: price (display text), priceAmount (rupees, not paise), currency INR, durationDays. These are display prices, not a checkout authority.
- Rituals: date (YYYY-MM-DD, date only), badge, benefitsTitle, benefits with iconUrl, imageUrl and imageAlt. The supplied September 27, 2026 design date is editorial content; no automatic expiry/filtering is applied.
- Master: name, values, imageUrl, imageAlt, actionLabel and actionUrl.
- Corporate: headline, description, imageUrl, imageAlt and actionLabel.
- Success stories: name, location, quote, category, photo, icon, imageUrl and iconUrl.
- Videos: name, role, imageUrl and nullable videoUrl. No playable media was supplied; videoUrl remains null until real URLs are provided.

Content is stored in dedicated PostgreSQL section and item tables. See [database setup and editing](landing-database.md). `src/landing/landing.data.js` is seed-only; live routes never import it. Image paths beginning /images/landing resolve against the frontend origin. No uploaded images or videos are served by these endpoints.

## Frontend
The homepage browser loader requests all ten routes concurrently with no-store
on each mount, including refresh and new visits. Requests appear in browser
DevTools Network → Fetch/XHR. Leaving the page cancels pending requests; Retry
starts a new batch. Development Strict Mode can show cancelled duplicate requests.

Set `API_URL=https://livewheel-backend-liard.vercel.app/api/v1` in the frontend.
Optional `LANDING_CONTENT_API_URL` overrides the public landing base (must end
in /api/v1/landing). Both values are public and applied at frontend build time.
`LANDING_CONTENT_SOURCE` is no longer used; the homepage always fetches the APIs.
Deploy backend first, then rebuild/redeploy frontend. Ensure backend CORS allows
the frontend origin. Content renders after the browser fetch finishes.

## Verification
Run `npm run build`, then `npm test`. HTTP tests use the Express app with fake database dependencies, so they do not need database or email credentials. Landing, auth and health routes use Prisma.
