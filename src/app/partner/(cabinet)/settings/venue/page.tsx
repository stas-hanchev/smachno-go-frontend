'use client';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import NextLink from 'next/link';
import { errorMessage } from '@/api/client';
import { usePartnerVenue } from '@/components/partner/PartnerContext';
import {
  ClosuresSection,
  HoursSection,
  ImagesSection,
  LegalSection,
  LocationSection,
  ProfileSection,
  SectionPanel,
} from '@/components/partner/VenueSections';
import { AccessDenied } from '@/components/ui/AccessDenied';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useVenueProfile } from '@/hooks/useVenueProfile';
import { ua } from '@/i18n/ua';

const t = ua.partner.venueSettings;

export default function VenueSettingsPage() {
  const { venue, isOwner } = usePartnerVenue();
  const profile = useVenueProfile(venue.id);

  if (!isOwner) return <AccessDenied text={ua.partner.ownerOnly} />;

  return (
    <>
      <SectionHeading
        level="h1"
        size="medium"
        title={t.title}
        subtitle={venue.name}
        action={
          venue.status === 'active' ? (
            <Button
              component={NextLink}
              href={`/venues/${venue.slug}`}
              target="_blank"
              endIcon={<OpenInNewIcon />}
            >
              {ua.admin.venues.open}
            </Button>
          ) : undefined
        }
      />
      {profile.isError && <Alert severity="error">{errorMessage(profile.error)}</Alert>}
      {profile.isPending ? (
        <Skeleton variant="rounded" height={480} sx={{ borderRadius: '24px' }} />
      ) : profile.data ? (
        <Stack spacing={3}>
          <SectionPanel title={t.basics}>
            <ProfileSection key={`p-${profile.data.id}`} profile={profile.data} />
          </SectionPanel>
          <SectionPanel title={t.images}>
            <ImagesSection profile={profile.data} />
          </SectionPanel>
          <SectionPanel title={t.location}>
            <LocationSection key={`l-${profile.data.id}`} profile={profile.data} />
          </SectionPanel>
          <SectionPanel title={t.hours}>
            <HoursSection key={`h-${profile.data.id}`} profile={profile.data} />
          </SectionPanel>
          <SectionPanel title={t.closures}>
            <ClosuresSection profile={profile.data} />
          </SectionPanel>
          <SectionPanel title={t.legal}>
            <LegalSection key={`g-${profile.data.id}`} profile={profile.data} />
          </SectionPanel>
        </Stack>
      ) : null}
    </>
  );
}
