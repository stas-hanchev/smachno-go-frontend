'use client';

import SearchIcon from '@mui/icons-material/Search';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import Alert from '@mui/material/Alert';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { searchListings } from '@/api/catalog';
import { errorMessage } from '@/api/client';
import type { ListingSort } from '@/api/types';
import { FiltersPanel } from '@/components/catalog/FiltersPanel';
import { LocationChip } from '@/components/layout/LocationChip';
import { PageContainer, PageMain } from '@/components/layout/PageContainer';
import { ListingGrid, ListingGridSkeleton } from '@/components/listing/ListingGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSearchArea } from '@/hooks/useSearchArea';
import { ua } from '@/i18n/ua';
import {
  activeFilterCount,
  parseFilters,
  serializeFilters,
  type CatalogFilters,
} from '@/lib/catalog-filters';
import { RADIUS_OPTIONS_KM, useLocationStore } from '@/stores/location';
import { shadows } from '@/theme/theme';

const PAGE_SIZE = 24;

const Layout = styled('div', { name: 'SgSearchView', slot: 'Layout' })(({ theme }) => ({
  display: 'grid',
  gap: 32,
  gridTemplateColumns: '1fr',
  alignItems: 'start',
  [theme.breakpoints.up('md')]: { gridTemplateColumns: '280px 1fr' },
}));

const Sidebar = styled('aside', { name: 'SgSearchView', slot: 'Sidebar' })(({ theme }) => ({
  display: 'none',
  position: 'sticky',
  top: 104,
  padding: 24,
  borderRadius: 20,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
  [theme.breakpoints.up('md')]: { display: 'block' },
}));

const Toolbar = styled('div', { name: 'SgSearchView', slot: 'Toolbar' })({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 12,
  marginBottom: 24,
});

const MobileOnly = styled('div', { name: 'SgSearchView', slot: 'MobileOnly' })(({ theme }) => ({
  [theme.breakpoints.up('md')]: { display: 'none' },
}));

export function SearchView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const { point, radiusKm, ready } = useSearchArea();
  const [q, setQ] = useState(filters.q);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [syncedQ, setSyncedQ] = useState(filters.q);
  if (syncedQ !== filters.q) {
    setSyncedQ(filters.q);
    setQ(filters.q);
  }

  function update(patch: Partial<CatalogFilters>) {
    const query = serializeFilters({ ...filters, ...patch });
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed === filters.q) return;
    const timer = setTimeout(() => update({ q: trimmed }), 400);
    return () => clearTimeout(timer);
  });

  const results = useInfiniteQuery({
    queryKey: ['listings', 'search', { filters, point, radiusKm }],
    queryFn: ({ pageParam }) =>
      searchListings({
        ...point,
        radiusKm,
        q: filters.q || undefined,
        categoryIds: filters.categoryIds.length ? filters.categoryIds : undefined,
        tagIds: filters.tagIds.length ? filters.tagIds : undefined,
        priceMin: filters.priceMin ?? undefined,
        priceMax: filters.priceMax ?? undefined,
        pickup: filters.pickup ?? undefined,
        availableOnly: filters.availableOnly,
        sort: filters.sort,
        page: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page * last.meta.limit < last.meta.total ? last.meta.page + 1 : undefined,
    enabled: ready,
    placeholderData: keepPreviousData,
  });

  const items = results.data?.pages.flatMap((p) => p.data) ?? [];
  const total = results.data?.pages[0]?.meta.total ?? 0;
  const filterCount = activeFilterCount(filters);

  return (
    <PageMain>
      <PageContainer>
        <Typography variant="h2" component="h1" sx={{ mb: 3 }}>
          {ua.catalog.title}
        </Typography>
        <Layout>
          <Sidebar aria-label={ua.catalog.filters}>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              {ua.catalog.filters}
            </Typography>
            <FiltersPanel filters={filters} onChange={update} />
          </Sidebar>

          <section>
            <Toolbar>
              <TextField
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={ua.catalog.searchPlaceholder}
                sx={{ flex: '1 1 260px' }}
                slotProps={{
                  htmlInput: { 'aria-label': ua.catalog.searchPlaceholder },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                select
                label={ua.catalog.sort}
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as ListingSort })}
                sx={{ minWidth: 200 }}
              >
                {Object.entries(ua.catalog.sortLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label={ua.catalog.radius}
                value={radiusKm}
                onChange={(e) => useLocationStore.getState().setRadius(Number(e.target.value))}
                sx={{ minWidth: 120 }}
              >
                {RADIUS_OPTIONS_KM.map((km) => (
                  <MenuItem key={km} value={km}>
                    {ua.common.km(km)}
                  </MenuItem>
                ))}
              </TextField>
              <LocationChip variant="button" />
              <MobileOnly>
                <Badge badgeContent={filterCount} color="success">
                  <Button
                    variant="outlined"
                    startIcon={<TuneIcon />}
                    onClick={() => setDrawerOpen(true)}
                  >
                    {ua.catalog.filters}
                  </Button>
                </Badge>
              </MobileOnly>
            </Toolbar>

            {results.isSuccess && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} aria-live="polite">
                {ua.catalog.found(total)}
              </Typography>
            )}
            {results.isError && <Alert severity="error">{errorMessage(results.error)}</Alert>}
            {!ready || results.isPending ? (
              <ListingGridSkeleton count={6} columns={3} />
            ) : items.length > 0 ? (
              <>
                <ListingGrid listings={items} columns={3} />
                {results.hasNextPage && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => void results.fetchNextPage()}
                      disabled={results.isFetchingNextPage}
                    >
                      {ua.common.showMore}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={<SearchOffOutlinedIcon />}
                title={ua.catalog.emptyTitle}
                text={ua.catalog.emptyText}
              />
            )}
          </section>
        </Layout>
      </PageContainer>

      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24, p: 3, maxHeight: '85vh' },
          },
        }}
      >
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          {ua.catalog.filters}
        </Typography>
        <FiltersPanel filters={filters} onChange={update} />
        <Button
          variant="contained"
          size="large"
          sx={{ mt: 3 }}
          onClick={() => setDrawerOpen(false)}
        >
          {ua.catalog.showResults}
        </Button>
      </Drawer>
    </PageMain>
  );
}
