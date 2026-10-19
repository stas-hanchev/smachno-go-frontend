import type { ListingSort, PickupFilter } from '@/api/types';

export interface CatalogFilters {
  q: string;
  categoryIds: number[];
  tagIds: number[];
  priceMin: number | null;
  priceMax: number | null;
  pickup: PickupFilter | null;
  availableOnly: boolean;
  sort: ListingSort;
}

export const DEFAULT_FILTERS: CatalogFilters = {
  q: '',
  categoryIds: [],
  tagIds: [],
  priceMin: null,
  priceMax: null,
  pickup: null,
  availableOnly: true,
  sort: 'distance',
};

const SORTS: ListingSort[] = ['distance', 'rating', 'discount', 'price', 'pickup'];
const PICKUPS: PickupFilter[] = ['now', 'today', 'tonight', 'tomorrow'];

interface ParamsReader {
  get: (key: string) => string | null;
}

function ids(value: string | null) {
  if (!value) return [];
  return [
    ...new Set(
      value
        .split(',')
        .map((v) => Number(v))
        .filter((v) => Number.isInteger(v) && v > 0),
    ),
  ].slice(0, 20);
}

function price(value: string | null) {
  if (value === null || value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function parseFilters(params: ParamsReader): CatalogFilters {
  const sort = params.get('sort') as ListingSort | null;
  const pickup = params.get('pickup') as PickupFilter | null;
  return {
    q: (params.get('q') ?? '').slice(0, 100),
    categoryIds: ids(params.get('categoryIds')),
    tagIds: ids(params.get('tagIds')),
    priceMin: price(params.get('priceMin')),
    priceMax: price(params.get('priceMax')),
    pickup: pickup && PICKUPS.includes(pickup) ? pickup : null,
    availableOnly: params.get('all') !== '1',
    sort: sort && SORTS.includes(sort) ? sort : DEFAULT_FILTERS.sort,
  };
}

export function serializeFilters(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.categoryIds.length) params.set('categoryIds', filters.categoryIds.join(','));
  if (filters.tagIds.length) params.set('tagIds', filters.tagIds.join(','));
  if (filters.priceMin !== null) params.set('priceMin', String(filters.priceMin));
  if (filters.priceMax !== null) params.set('priceMax', String(filters.priceMax));
  if (filters.pickup) params.set('pickup', filters.pickup);
  if (!filters.availableOnly) params.set('all', '1');
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort);
  return params.toString();
}

export function activeFilterCount(filters: CatalogFilters) {
  return (
    filters.categoryIds.length +
    filters.tagIds.length +
    (filters.priceMin !== null ? 1 : 0) +
    (filters.priceMax !== null ? 1 : 0) +
    (filters.pickup ? 1 : 0) +
    (filters.availableOnly ? 0 : 1)
  );
}

export function toggleId(list: number[], id: number) {
  return list.includes(id) ? list.filter((v) => v !== id) : [...list, id];
}
