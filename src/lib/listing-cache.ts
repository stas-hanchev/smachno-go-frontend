import type { ListingUpdate } from '@/api/types';

type Json = unknown;

function isListingLike(value: Record<string, unknown>) {
  return 'quantityLeft' in value && 'pickupStart' in value && typeof value.id === 'number';
}

export function patchListing(value: Json, update: ListingUpdate): Json {
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const patched = patchListing(item, update);
      if (patched !== item) changed = true;
      return patched;
    });
    return changed ? next : value;
  }
  if (value === null || typeof value !== 'object') return value;

  const record = value as Record<string, unknown>;
  if (isListingLike(record)) {
    if (record.id !== update.listingId) return value;
    return {
      ...record,
      quantityLeft: update.quantityLeft,
      quantityTotal: update.quantityTotal,
      status: update.status,
    };
  }
  for (const key of ['data', 'pages'] as const) {
    if (key in record) {
      const patched = patchListing(record[key], update);
      if (patched !== record[key]) return { ...record, [key]: patched };
    }
  }
  return value;
}
