# SmachnoGo Web

Web app for SmachnoGo. Specification: TZ 1.1 (`smachnogo-tz.md` in the workspace root), design: Figma file
«СмачноGo» (mobile 412×917 and desktop 1280 frames).

Stack: Next.js 16 (App Router), React 19, TypeScript (strict), MUI 9 on the styled-components engine,
TanStack Query, axios, Formik + Yup, Zustand, socket.io-client, Mapbox (`mapbox-gl` + `react-map-gl`), `qrcode.react`.
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

The e2e test registers a new user, reads the verification email from MailHog (`E2E_MAILHOG_URL`, default
`http://localhost:8025`), books a set and pays with the test provider. It needs the API with
`PAYMENT_PROVIDER=fake`, the dev server and fresh seed data; run `npx playwright install chromium` once.
The API allows 5 registrations per hour per IP (in memory), so restart the API between frequent runs.

## Structure

```
src/
  app/            # routes (see below), layout, providers
  api/            # axios client with token refresh, endpoint functions, server-side fetch, API types
  components/     # layout (header, tab bar, footer), listing, orders, maps, auth, profile, ui
  hooks/          # search area, booking, countdown, login redirect
  i18n/ua.ts      # every UI text
  lib/            # formatting (Kyiv time, money, distance), filters <-> URL, geo, styled-components registry
  stores/         # Zustand: session, location (persisted), notifications
  theme/          # MUI theme with the design tokens from TZ 10.2
test/             # Vitest
e2e/              # Playwright
```

`@mui/styled-engine` is aliased to `@mui/styled-engine-sc`, so MUI renders through styled-components.
Every `styled()` call passes `{ name, slot }`: the label keeps class names identical on the server and the
client (no hydration mismatch) and stops `sx` from reaching the DOM.

## Routes

`/`, `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`, `/location`, `/search`,
`/map`, `/venues/[slug]` (SSR), `/listings/[id]` (SSR), `/checkout/[publicId]`, `/orders`,
`/orders/[publicId]`, `/orders/[publicId]/success`, `/favorites`, `/profile`, `/profile/settings`,
`/profile/notifications`.

## Decisions that differ from TZ 1.1

- Next.js 16 and MUI 9 instead of 15 and 6.
- Mapbox (maps and Geocoding API v6) instead of Google Maps and Google Places: a Google Cloud billing account
  could not be created. Map components load on the client only (`components/maps/LazyMaps.tsx`).
- Routes are protected on the client (`RequireAuth`), not in `middleware.ts`: the refresh cookie has the path
  `/api/v1/auth`, so the Next.js server never sees it. The API checks access anyway.
- Catalog filters live in the URL (`lib/catalog-filters.ts`) instead of a `useFiltersStore`.
- The home page is client-rendered because it depends on the stored location; venue and set pages are SSR.
- The home hero shows the biggest discount nearby instead of «Пропозиція дня» until recommendations exist.

## Not done yet (step 3)

Partner cabinet and `/for-business`, admin panel, `/for-you` recommendations, `/terms` and `/privacy`,
photo uploads (cards show category placeholders), web push.
