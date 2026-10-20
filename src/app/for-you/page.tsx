'use client';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { errorMessage } from '@/api/client';
import { getRecommendations } from '@/api/recommendations';
import { LocationChip } from '@/components/layout/LocationChip';
import { PageContainer, PageMain } from '@/components/layout/PageContainer';
import { ListingGrid, ListingGridSkeleton } from '@/components/listing/ListingGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useSearchArea } from '@/hooks/useSearchArea';
import { ua } from '@/i18n/ua';

export default function ForYouPage() {
  const { point, radiusKm, ready } = useSearchArea();
  const recommendations = useQuery({
    queryKey: ['recommendations', 'list', { point, radiusKm }],
    queryFn: () => getRecommendations(point!, radiusKm),
    enabled: ready,
  });
  const items = recommendations.data?.data ?? [];

  return (
    <PageMain>
      <PageContainer>
        <SectionHeading
          level="h1"
          overline={ua.forYou.overline}
          title={ua.forYou.title}
          subtitle={ua.forYou.subtitle}
          action={<LocationChip variant="button" />}
        />
        {recommendations.data && items.length > 0 && (
          <Alert severity="info" icon={<AutoAwesomeOutlinedIcon />} sx={{ mb: 3 }}>
            {recommendations.data.meta.personalized ? ua.forYou.personalized : ua.forYou.popular}
          </Alert>
        )}
        {recommendations.isError && (
          <Alert severity="error">{errorMessage(recommendations.error)}</Alert>
        )}
        {!ready || recommendations.isPending ? (
          <ListingGridSkeleton count={8} />
        ) : items.length > 0 ? (
          <ListingGrid listings={items} source="recommendation" />
        ) : (
          <EmptyState
            icon={<StorefrontOutlinedIcon />}
            title={ua.forYou.emptyTitle}
            text={ua.forYou.emptyText}
            action={
              <Button component={Link} href="/location" variant="contained">
                {ua.home.changeLocation}
              </Button>
            }
          />
        )}
      </PageContainer>
    </PageMain>
  );
}
