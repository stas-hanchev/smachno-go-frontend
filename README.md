# SmachnoGo Web

Web app for SmachnoGo. Specification: TZ 1.1 (`smachnogo-tz.md` in the workspace root), design: Figma file
«СмачноGo» (mobile 412×917 and desktop 1280 frames).

Stack: Next.js 16 (App Router), React 19, TypeScript (strict), MUI 9 on the styled-components engine,
TanStack Query, axios, Formik + Yup, Zustand, socket.io-client, Mapbox (`mapbox-gl` + `react-map-gl`), `qrcode.react`,
`@zxing/browser` (QR scanning in the partner cabinet).
Font: Manrope (`next/font/google`).

## Quick start

The API (`smachno-go-backend`) must be running on `API_URL` (default `http://localhost:4000`).

```bash
cp .env.example .env
npm install
npm run dev                       # http://localhost:3000
```

Next.js proxies `/api/v1/*` to `API_URL`, so the browser talks to one origin and the refresh cookie
(`sg_rt`, path `/api/v1/auth`) stays first-party. The access token is kept in memory (Zustand);
on start-up and on any 401 the client calls `/auth/refresh` once and retries.

## Environment

| Variable                       | Purpose                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `API_URL`                      | API origin for the `/api/v1` proxy and server-side rendering                      |
| `NEXT_PUBLIC_SITE_URL`         | Public site URL (metadata)                                                        |
| `NEXT_PUBLIC_API_ORIGIN`       | API origin for Socket.io (must be in the API `CORS_ORIGINS`)                      |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google sign-in; the button is hidden while empty (the API needs the same id)      |
| `NEXT_PUBLIC_MAPBOX_TOKEN`     | Public Mapbox token (`pk.…`): `/map`, address search (Geocoding v6), set page map |
| `NEXT_PUBLIC_SUPPORT_EMAIL`    | Contact email on `/terms` and `/privacy` (default `support@smachnogo.local`)      |

Without the Mapbox token `/map` shows venues as a list and `/location` offers geolocation and the city choice only.
`NEXT_PUBLIC_*` values are inlined at build time, so restart `npm run dev` after changing them.

## Scripts

| Script                                                | What it does                                    |
| ----------------------------------------------------- | ----------------------------------------------- |
| `npm run dev`                                         | Dev server                                      |
| `npm run build` / `npm start`                         | Production build and server                     |
| `npm run typecheck`, `npm run lint`, `npm run format` | Checks                                          |
| `npm test`                                            | Vitest + Testing Library, jsdom                 |
| `npm run test:e2e`                                    | Playwright, mobile 412×917 and desktop 1280×800 |

Two e2e tests run against the API with `PAYMENT_PROVIDER=fake` (or `ALLOW_FAKE_PAYMENTS=true`), the dev
server and fresh seed data; run `npx playwright install chromium` once.

- `buyer-flow.spec.ts` registers a new user, reads the verification email from MailHog (`E2E_MAILHOG_URL`, default
  `http://localhost:8025`), books a set and pays with the test provider. The API allows 5 registrations per hour
  per IP (in memory), so restart the API between frequent runs.
- `partner-pickup.spec.ts` buys a set for today as the seeded buyer (`customer@smachnogo.local`), then signs in as
  the seeded partner (`partner@smachnogo.local`), opens `/partner/pickup` for that venue and hands the order out by
  its code. Codes are checked only for today's orders, so the test needs a set on sale today.

The API must send mail to MailHog (`SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, no SMTP user). Every run buys up to four
sets, and the API allows 5 sign-ins per 15 minutes per email and IP: after a few runs reseed the data and restart the
API. To keep a dev setup that sends mail through Brevo untouched, start a second API and a production build on other
ports and point the tests at it:

```bash
# smachno-go-backend
PORT=4100 CORS_ORIGINS=http://localhost:3200 RUN_JOBS_IN_PROCESS=false SMTP_HOST=127.0.0.1 SMTP_PORT=1025   SMTP_USER= SMTP_PASSWORD= npx tsx --env-file-if-exists=.env src/server.ts
# smachno-go-frontend
API_URL=http://localhost:4100 NEXT_PUBLIC_API_ORIGIN=http://localhost:4100 npm run build && npx next start -p 3200
E2E_BASE_URL=http://localhost:3200 npm run test:e2e
```

Rebuild with the default variables afterwards: the build keeps `API_URL`.

## Structure

```
src/
  app/            # routes (see below), layout, providers
  api/            # axios client with token refresh, endpoint functions, server-side fetch, API types
  components/     # layout, listing, orders, maps, auth, profile, partner (cabinet), admin, ui
  hooks/          # search area, booking, countdown, login redirect, impressions, dictionaries
  i18n/ua.ts      # every UI text
  lib/            # formatting (Kyiv time, money, distance), filters <-> URL, geo, interactions, partner stats
  stores/         # Zustand: session, location (persisted), notifications, partner (selected venue, sound)
  theme/          # MUI theme with the design tokens from TZ 10.2
test/             # Vitest
e2e/              # Playwright
```

`@mui/styled-engine` is aliased to `@mui/styled-engine-sc`, so MUI renders through styled-components.
Every `styled()` call passes `{ name, slot }`: the label keeps class names identical on the server and the
client (no hydration mismatch) and stops `sx` from reaching the DOM.

## Routes

Buyer: `/`, `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`, `/location`, `/search`,
`/map`, `/for-you`, `/venues/[slug]` (SSR), `/listings/[id]` (SSR), `/checkout/[publicId]`, `/orders`,
`/orders/[publicId]`, `/orders/[publicId]/success`, `/favorites`, `/profile`, `/profile/settings`,
`/profile/notifications`, `/terms` and `/privacy` (static).

Business: `/for-business` (landing page and partner application; a guest registers in the same form),
`/partner/invite?token=` (accept a team invitation).

Partner cabinet (`app/partner/(cabinet)`, a venue member only): `/partner` (today: stats, listings, quantity
and closing), `/partner/pickup` (QR scan or 6-character code), `/partner/orders`, `/partner/offers`,
`/partner/onboarding` (profile, location, legal data, photos, hours, activation), `/partner/settings/venue`,
`/partner/settings/team`. New orders arrive over Socket.io (`venue:subscribe`) with a notification and a chime.

Admin panel (`super_admin` only): `/admin/applications`, `/admin/venues`, `/admin/users`, `/admin/orders`
(details and refunds), `/admin/dictionaries`, `/admin/settings` (business settings and recommendation weights),
`/admin/audit-log`.

Cabinet pages render without the footer and the buyer tab bar. A signed-in user without access sees a 403 page.

## Recommendations and interactions

The home hero comes from `/recommendations/daily`, the «Для тебе сьогодні» section and `/for-you` from
`/recommendations`. Cards report impressions (50% visible, once per offer and source), set pages report views,
and bookings carry `source`. Events are batched (`lib/interactions.ts`, up to 50 events or every 4 s, flushed
on `pagehide` with `keepalive`) and sent to `/interactions` with an anonymous ULID (`sg-anon-id` in
`localStorage`). Links from a section add `?from=<source>`, so a view and an order keep the source.

## CI

`.github/workflows/ci.yml` runs lint, typecheck, Prettier, Vitest and the production build on every push to `main`
and on pull requests. The Playwright tests are not part of CI: they need a running API with seed data.

## Decisions that differ from TZ 1.1

- Next.js 16 and MUI 9 instead of 15 and 6.
- Mapbox (maps and Geocoding API v6) instead of Google Maps and Google Places: a Google Cloud billing account
  could not be created. Map components load on the client only (`components/maps/LazyMaps.tsx`).
- Routes are protected on the client (`RequireAuth`), not in `middleware.ts`: the refresh cookie has the path
  `/api/v1/auth`, so the Next.js server never sees it. The API checks access anyway.
- Catalog filters live in the URL (`lib/catalog-filters.ts`) instead of a `useFiltersStore`.
- The home page is client-rendered because it depends on the stored location; venue and set pages are SSR.
- Admin tables use MUI `Table` with server-side pagination instead of MUI X `DataGrid`: DataGrid needs the Emotion
  engine, and the app runs MUI on styled-components.
- Payments use the test provider until LiqPay is connected.

## Not done yet

Web push. The texts of `/terms` and `/privacy` (`legal` in `i18n/ua.ts`) are a draft for a lawyer to review.
