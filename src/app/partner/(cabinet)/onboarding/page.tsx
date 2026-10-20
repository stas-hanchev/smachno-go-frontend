'use client';

import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { errorMessage, normalizeError } from '@/api/client';
import { activateVenue, listOffers } from '@/api/partner';
import type { VenueProfile } from '@/api/types';
import { OfferForm } from '@/components/partner/OfferForm';
import { usePartnerVenue } from '@/components/partner/PartnerContext';
import {
  HoursSection,
  LocationSection,
  ProfileSection,
  SectionPanel,
  venueProfileKey,
} from '@/components/partner/VenueSections';
import { AccessDenied } from '@/components/ui/AccessDenied';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useVenueProfile } from '@/hooks/useVenueProfile';
import { ua } from '@/i18n/ua';
import { notify } from '@/stores/notify';
import { shadows } from '@/theme/theme';

const t = ua.partner.onboarding;
const LAST_STEP = 3;

const Preview = styled('div', { name: 'SgOnboarding', slot: 'Preview' })(({ theme }) => ({
  display: 'flex',
  gap: 14,
  padding: 16,
  borderRadius: 20,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.raised,
  maxWidth: 420,
  '& img': { width: 56, height: 56, borderRadius: 14, objectFit: 'cover' },
}));

const LogoBox = styled('span', { name: 'SgOnboarding', slot: 'LogoBox' })(({ theme }) => ({
  width: 56,
  height: 56,
  flexShrink: 0,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.mint.light,
  color: theme.palette.success.main,
  overflow: 'hidden',
}));

const Logo = styled('img', { name: 'SgOnboarding', slot: 'Logo' })({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

function VenuePreview({ profile }: { profile: VenueProfile }) {
  return (
    <div>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t.preview}
      </Typography>
      <Preview>
        <LogoBox aria-hidden>
          {profile.logoUrl ? (
            <Logo src={profile.logoUrl} alt="" />
          ) : (
            <CategoryIcon name={profile.category.name} />
          )}
        </LogoBox>
        <div style={{ minWidth: 0 }}>
          <Typography variant="h6" component="p">
            {profile.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {profile.category.name} · {profile.address}
          </Typography>
        </div>
      </Preview>
    </div>
  );
}

function ActivationStep({ profile, onDone }: { profile: VenueProfile; onDone: () => void }) {
  const queryClient = useQueryClient();
  const activate = useMutation({
    mutationFn: () => activateVenue(profile.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(venueProfileKey(profile.id), updated);
      void queryClient.invalidateQueries({ queryKey: ['partner', 'venues'] });
      notify.success(t.activated);
      onDone();
    },
  });
  const missing = activate.error
    ? normalizeError(activate.error).details
    : profile.activation.missing;

  return (
    <Stack spacing={2}>
      {missing.length > 0 && (
        <Alert severity="warning">
          {t.missing}
          <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
            {missing.map((m) => (
              <li key={m.field}>{m.message}</li>
            ))}
          </ul>
        </Alert>
      )}
      {activate.isError && missing.length === 0 && (
        <Alert severity="error">{errorMessage(activate.error)}</Alert>
      )}
      <div>
        <Button
          variant="contained"
          size="large"
          startIcon={<RocketLaunchOutlinedIcon />}
          disabled={activate.isPending}
          onClick={() => activate.mutate()}
        >
          {t.activate}
        </Button>
      </div>
    </Stack>
  );
}

export default function OnboardingPage() {
  const { venue, isOwner } = usePartnerVenue();
  const router = useRouter();
  const profile = useVenueProfile(venue.id);
  const offers = useQuery({
    queryKey: ['partner', venue.id, 'offers'],
    queryFn: () => listOffers(venue.id),
    enabled: isOwner,
  });
  const [step, setStep] = useState(0);
  const next = () => setStep((s) => Math.min(LAST_STEP, s + 1));

  if (!isOwner) return <AccessDenied text={ua.partner.ownerOnly} />;

  const data = profile.data;
  const hasOffer = (offers.data ?? []).some((o) => o.status !== 'archived');

  return (
    <>
      <SectionHeading level="h1" size="medium" title={t.title} subtitle={t.subtitle} />
      {profile.isError && <Alert severity="error">{errorMessage(profile.error)}</Alert>}
      {!data ? (
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: '24px' }} />
      ) : data.status !== 'draft' ? (
        <Alert severity="success">{t.alreadyActive}</Alert>
      ) : (
        <Stack spacing={3}>
          <Stepper nonLinear activeStep={step} alternativeLabel>
            {t.steps.map((label, index) => (
              <Step key={label} completed={index < step || (index === LAST_STEP && hasOffer)}>
                <StepButton onClick={() => setStep(index)}>{label}</StepButton>
              </Step>
            ))}
          </Stepper>
          <SectionPanel title={t.steps[step] ?? ''}>
            {step === 0 && <ProfileSection profile={data} submitLabel={t.next} onSaved={next} />}
            {step === 1 && <LocationSection profile={data} submitLabel={t.next} onSaved={next} />}
            {step === 2 && <HoursSection profile={data} submitLabel={t.next} onSaved={next} />}
            {step === 3 && (
              <Stack spacing={3}>
                {!hasOffer && (
                  <OfferForm
                    venueId={venue.id}
                    offer={null}
                    submitLabel={t.next}
                    onSaved={() => notify.success(t.offerCreated)}
                  />
                )}
                <VenuePreview profile={data} />
                <ActivationStep profile={data} onDone={() => router.push('/partner')} />
              </Stack>
            )}
          </SectionPanel>
          {step > 0 && (
            <div>
              <Button onClick={() => setStep((s) => s - 1)}>{t.back}</Button>
            </div>
          )}
        </Stack>
      )}
    </>
  );
}
