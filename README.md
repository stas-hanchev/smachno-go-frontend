# SmachnoGo Web

Web app for SmachnoGo. Specification: TZ 1.1 (`tz/smachnogo-tz.md` in the project files).

Stack: Next.js 16 (App Router), React 19, TypeScript (strict), MUI 9 on the styled-components engine,
TanStack Query, axios, Formik + Yup, Zustand.

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

## Scripts

| Script                                                | What it does                    |
| ----------------------------------------------------- | ------------------------------- |
| `npm run dev`                                         | Dev server                      |
| `npm run build` / `npm start`                         | Production build and server     |
| `npm run typecheck`, `npm run lint`, `npm run format` | Checks                          |
| `npm test`                                            | Vitest + Testing Library, jsdom |

## Structure

```
src/
  app/            # routes: catalog (/), login; layout and providers
  api/            # axios client with token refresh, endpoint functions, API types
  components/     # shared UI
  lib/            # formatting (Kyiv time, money, distance), styled-components SSR registry
  stores/         # Zustand stores
  theme/          # MUI theme
test/
```

`@mui/styled-engine` is aliased to `@mui/styled-engine-sc`, so MUI renders through styled-components.

## Done so far

Catalog page with geolocation (falls back to the first city), search and sorting; login; session
bootstrap and logout. Next: listing and venue pages, registration, checkout with the fake payment,
orders and voucher QR, partner cabinet.
