'use client';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { getCategories, searchListings } from '@/api/catalog';
import { errorMessage } from '@/api/client';
import type { ListingSort } from '@/api/types';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { HeroOffer } from '@/components/home/HeroOffer';
import { LocationChip } from '@/components/layout/LocationChip';
import { PageContainer } from '@/components/layout/PageContainer';
import { ListingGrid, ListingGridSkeleton } from '@/components/listing/ListingGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterChips } from '@/components/ui/FilterChips';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useSearchArea } from '@/hooks/useSearchArea';
import { ua } from '@/i18n/ua';
import { withDistanceFrom } from '@/lib/geo';
import { useSessionStore } from '@/stores/session';
import { shadows } from '@/theme/theme';

const CITY_RADIUS_KM = 30;
const NEAR_LIMIT = 8;

type NearSort = Extract<ListingSort, 'distance' | 'rating' | 'discount'>;

const NEAR_SORTS: { value: NearSort; label: string }[] = [
  { value: 'distance', label: ua.home.sortDistance },
  { value: 'rating', label: ua.home.sortRating },
  { value: 'discount', label: ua.home.sortDiscount },
];

const Section = styled('section', { name: 'SgHome', slot: 'Section' })(({ theme }) => ({
  paddingBottom: 40,
  [theme.breakpoints.up('md')]: { paddingBottom: 56 },
}));

const SearchCard = styled('form', { name: 'SgHome', slot: 'SearchCard' })(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: 8,
  borderRadius: 16,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
  [theme.breakpoints.up('md')]: { padding: 12 },
}));

const SearchInput = styled('label', { name: 'SgHome', slot: 'SearchInput' })(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '8px 16px',
  borderRadius: 12,
  backgroundColor: theme.palette.mint.light,
  '& svg': { color: theme.palette.muted, fontSize: 20 },
  '& .MuiInputBase-root': { flex: 1 },
}));

const DesktopActions = styled('div', { name: 'SgHome', slot: 'DesktopActions' })(({ theme }) => ({
  display: 'none',
  alignItems: 'center',
  gap: 8,
  [theme.breakpoints.up('md')]: { display: 'flex' },
}));

const EcoBanner = styled('section', { name: 'SgHome', slot: 'EcoBanner' })(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 20,
  padding: 24,
  borderRadius: 20,
  backgroundColor: '#DEF2EE',
  [theme.breakpoints.up('md')]: { padding: 32 },
}));

const EcoIcon = styled('span', { name: 'SgHome', slot: 'EcoIcon' })(({ theme }) => ({
  width: 56,
  height: 56,
  flexShrink: 0,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
}));

export default function HomePage() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const { point, radiusKm, city, ready, isPrecise } = useSearchArea();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<NearSort>('distance');

  const hero = useQuery({
    queryKey: ['listings', 'hero', { point, radiusKm }],
    queryFn: () => searchListings({ ...point, radiusKm, sort: 'discount', limit: 1 }),
    enabled: ready,
  });

  const categories = useQuery({
    queryKey: ['categories', { point, radiusKm }],
    queryFn: () => getCategories(point, radiusKm),
    enabled: ready,
    placeholderData: keepPreviousData,
  });

  const near = useQuery({
    queryKey: ['listings', 'near', { point, radiusKm, sort }],
    queryFn: () => searchListings({ ...point, radiusKm, sort, limit: NEAR_LIMIT }),
    enabled: ready,
    placeholderData: keepPreviousData,
  });

  const cityCenter = city ? { lat: city.centerLat, lng: city.centerLng } : null;
  const nothingNearby =
    isPrecise && cityCenter !== null && !near.isPlaceholderData && near.data?.meta.total === 0;

  const cityListings = useQuery({
    queryKey: ['listings', 'near-city', { cityCenter, sort }],
    queryFn: () =>
      searchListings({ ...cityCenter, radiusKm: CITY_RADIUS_KM, sort, limit: NEAR_LIMIT }),
    enabled: nothingNearby,
  });

  const shown = nothingNearby ? cityListings : near;
  const rawItems = shown.data?.data ?? [];
  const items =
    nothingNearby && point ? withDistanceFrom(rawItems, point, sort === 'distance') : rawItems;
  const total = shown.data?.meta.total ?? 0;
  const sortedCategories = [...(categories.data ?? [])].sort(
    (a, b) => (b.activeListings ?? 0) - (a.activeListings ?? 0),
  );

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const query = q.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  }

  return (
    <main>
      <PageContainer sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 3, md: 3 } }}>
        <SearchCard role="search" onSubmit={submitSearch}>
          <SearchInput>
            <SearchIcon aria-hidden />
            <InputBase
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={ua.home.searchPlaceholder}
              inputProps={{ 'aria-label': ua.home.searchShort }}
            />
          </SearchInput>
          <DesktopActions>
            <LocationChip variant="button" />
            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: 'primary.dark', px: 3, py: 1.5 }}
              endIcon={<ArrowForwardIcon />}
            >
              {ua.home.findButton}
            </Button>
          </DesktopActions>
        </SearchCard>
      </PageContainer>

      <PageContainer>
        <Section>
          <HeroOffer
            listing={hero.data?.data[0] ?? null}
            loading={!ready || (hero.isPending && hero.fetchStatus !== 'idle')}
          />
        </Section>

        <Section aria-labelledby="categories-title">
          <SectionHeading
            title={ua.home.categoriesTitle}
            subtitle={ua.home.categoriesSubtitle}
            size="medium"
          />
          <CategoryTiles categories={sortedCategories} loading={!ready || categories.isPending} />
        </Section>

        <Section>
          <SectionHeading
            overline={ua.home.nearOverline}
            title={ua.home.nearTitle}
            action={
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                <FilterChips
                  label={ua.catalog.sort}
                  value={sort}
                  options={NEAR_SORTS}
                  onChange={setSort}
                />
                <Button
                  component={Link}
                  href={`/search?sort=${sort}`}
                  endIcon={<ArrowForwardIcon />}
                >
                  {ua.common.all(total)}
                </Button>
              </div>
            }
          />
          {nothingNearby && items.length > 0 && city && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {ua.home.nothingNearby(radiusKm, city.name)}
            </Alert>
          )}
          {shown.isError && <Alert severity="error">{errorMessage(shown.error)}</Alert>}
          {!ready || shown.isPending ? (
            <ListingGridSkeleton />
          ) : items.length > 0 ? (
            <ListingGrid listings={items} compactOnMobile />
          ) : (
            <EmptyState
              icon={<StorefrontOutlinedIcon />}
              title={ua.home.emptyTitle}
              text={ua.home.emptyText}
              action={
                <Button component={Link} href="/location" variant="contained">
                  {ua.home.changeLocation}
                </Button>
              }
            />
          )}
        </Section>

        <Section>
          <EcoBanner>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <EcoIcon aria-hidden>
                <SpaOutlinedIcon />
              </EcoIcon>
              <div>
                <Typography variant="h3" component="h2" sx={{ color: 'primary.dark' }}>
                  {ua.home.ecoTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ua.home.ecoText}
                </Typography>
              </div>
            </div>
            <Button
              component={Link}
              href={user ? '/search' : '/register'}
              endIcon={<ArrowForwardIcon />}
              sx={{ color: 'success.main' }}
            >
              {ua.home.ecoCta}
            </Button>
          </EcoBanner>
        </Section>
      </PageContainer>
    </main>
  );
}
