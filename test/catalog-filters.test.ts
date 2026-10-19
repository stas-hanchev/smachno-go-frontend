import {
  activeFilterCount,
  DEFAULT_FILTERS,
  parseFilters,
  serializeFilters,
  toggleId,
} from '@/lib/catalog-filters';

const parse = (query: string) => parseFilters(new URLSearchParams(query));

describe('catalog filters', () => {
  it('returns defaults for an empty query', () => {
    expect(parse('')).toEqual(DEFAULT_FILTERS);
    expect(serializeFilters(DEFAULT_FILTERS)).toBe('');
  });

  it('round-trips every filter through the URL', () => {
    const filters = {
      q: 'круасан',
      categoryIds: [1, 3],
      tagIds: [2],
      priceMin: 50,
      priceMax: 150,
      pickup: 'tonight' as const,
      availableOnly: false,
      sort: 'price' as const,
    };
    expect(parse(serializeFilters(filters))).toEqual(filters);
  });

  it('drops invalid values', () => {
    expect(
      parse('sort=cheapest&pickup=later&categoryIds=1,x,-2,1&priceMin=-5&priceMax=abc'),
    ).toEqual({ ...DEFAULT_FILTERS, categoryIds: [1] });
  });

  it('counts active filters and toggles ids', () => {
    expect(activeFilterCount(parse('categoryIds=1,2&pickup=now&all=1'))).toBe(4);
    expect(toggleId([1, 2], 2)).toEqual([1]);
    expect(toggleId([1], 2)).toEqual([1, 2]);
  });
});
