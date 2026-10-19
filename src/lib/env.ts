export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  apiOrigin: process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:4000',
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '',
};

export const mapsEnabled = Boolean(publicEnv.mapboxToken);

export const serverApiUrl = process.env.API_URL ?? 'http://localhost:4000';
