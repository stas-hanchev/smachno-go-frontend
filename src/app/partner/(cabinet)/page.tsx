'use client';

import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { errorMessage } from '@/api/client';
import { listListings, listOffers, listVenueOrders } from '@/api/partner';
import type { PartnerListing } from '@/api/types';
import { ListingControl } from '@/components/partner/ListingControl';
import { NewListingDialog } from '@/components/partner/NewListingDialog';
import { usePartnerVenue } from '@/components/partner/PartnerContext';
import { StatCard, StatGrid } from '@/components/partner/StatCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ua } from '@/i18n/ua';
import { formatPrice, kyivDateString } from '@/lib/format';
import { dayStats } from '@/lib/partner-stats';

const t = ua.partner.today;

function ListingSection({
  title,
  empty,
  items,
  venueId,
  isOwner,
}: {
  title: string;
  empty: string;
  items: PartnerListing[];
  venueId: number;
  isOwner: boolean;
}) {
  return (
    <section style={{ marginTop: 32 }}>
      <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
        {title}
      </Typography>
      {items.length === 0 ? (
        <Typography color="text.secondary">{empty}</Typography>
      ) : (
        <Stack spacing={1.5}>
          {items.map((listing) => (
            <ListingControl
              key={listing.id}
              venueId={venueId}
              listing={listing}
              isOwner={isOwner}
            />
          ))}
        </Stack>
      )}
    </section>
  );
}

export default function PartnerTodayPage() {
  const { venue, isOwner } = usePartnerVenue();
  const [dialogOpen, setDialogOpen] = useState(false);
  const today = kyivDateString();

  const listings = useQuery({
    queryKey: ['partner', venue.id, 'listings'],
    queryFn: () => listListings(venue.id),
  });
  const orders = useQuery({
    queryKey: ['partner', venue.id, 'orders', today, 'all'],
    queryFn: () => listVenueOrders(venue.id, today),
  });
  const offers = useQuery({
    queryKey: ['partner', venue.id, 'offers'],
    queryFn: () => listOffers(venue.id),
  });

  const stats = dayStats(orders.data ?? [], listings.data ?? [], offers.data ?? []);
  const todayItems = (listings.data ?? []).filter((l) => l.pickupDate === today);
  const tomorrowItems = (listings.data ?? []).filter((l) => l.pickupDate !== today);
  const error = listings.error ?? orders.error ?? offers.error;

  return (
    <>
      <SectionHeading
        level="h1"
        size="medium"
        title={ua.partner.nav.today}
        subtitle={venue.name}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            {t.newListing}
          </Button>
        }
      />
      {error && <Alert severity="error">{errorMessage(error)}</Alert>}
      {orders.isPending ? (
        <Skeleton variant="rounded" height={88} sx={{ borderRadius: '20px' }} />
      ) : (
        <StatGrid>
          <StatCard icon={<ShoppingBagOutlinedIcon />} label={t.sold} value={String(stats.sold)} />
          <StatCard
            icon={<PaymentsOutlinedIcon />}
            label={t.revenue}
            value={formatPrice(stats.revenue.toFixed(2))}
          />
          <StatCard icon={<AccessTimeIcon />} label={t.waiting} value={String(stats.waiting)} />
          <StatCard
            icon={<SpaOutlinedIcon />}
            label={t.savedKg}
            value={stats.savedKg.toLocaleString('uk-UA')}
          />
        </StatGrid>
      )}
      {listings.isPending ? (
        <Skeleton variant="rounded" height={240} sx={{ borderRadius: '20px', mt: 4 }} />
      ) : (
        <>
          <ListingSection
            title={t.todayListings}
            empty={t.noListings}
            items={todayItems}
            venueId={venue.id}
            isOwner={isOwner}
          />
          <ListingSection
            title={t.tomorrowListings}
            empty={t.noTomorrow}
            items={tomorrowItems}
            venueId={venue.id}
            isOwner={isOwner}
          />
        </>
      )}
      <NewListingDialog
        open={dialogOpen}
        venueId={venue.id}
        offers={offers.data ?? []}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
