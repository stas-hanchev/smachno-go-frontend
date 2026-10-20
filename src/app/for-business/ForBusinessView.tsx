'use client';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import NextLink from 'next/link';
import { useState } from 'react';
import { listMyApplications, listMyVenues } from '@/api/partner';
import type { PartnerApplication } from '@/api/types';
import { PageContainer } from '@/components/layout/PageContainer';
import { ApplicationForm } from '@/components/partner/ApplicationForm';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ua } from '@/i18n/ua';
import { formatDateTime } from '@/lib/format';
import { useSessionStore } from '@/stores/session';
import { shadows } from '@/theme/theme';

const t = ua.forBusiness;
const BENEFIT_ICONS = [PaymentsOutlinedIcon, SpaOutlinedIcon, InsightsOutlinedIcon];

const Hero = styled('section', { name: 'SgForBusiness', slot: 'Hero' })(({ theme }) => ({
  marginTop: 24,
  padding: '40px 24px',
  borderRadius: 24,
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary.dark,
  backgroundImage:
    'linear-gradient(90deg, rgba(13,31,28,0.92) 0%, rgba(13,31,28,0.7) 55%, rgba(13,31,28,0.2) 100%), url("/images/hero-pastry.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  boxShadow: shadows.raised,
  [theme.breakpoints.up('md')]: { padding: '72px 56px' },
}));

const Grid = styled('div', { name: 'SgForBusiness', slot: 'Grid' })<{ $columns: number }>(
  ({ theme, $columns }) => ({
    display: 'grid',
    gap: 20,
    gridTemplateColumns: '1fr',
    [theme.breakpoints.up('sm')]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    [theme.breakpoints.up('md')]: { gridTemplateColumns: `repeat(${$columns}, minmax(0, 1fr))` },
  }),
);

const Card = styled('div', { name: 'SgForBusiness', slot: 'Card' })(({ theme }) => ({
  padding: 24,
  borderRadius: 20,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
}));

const IconBox = styled('span', { name: 'SgForBusiness', slot: 'IconBox' })(({ theme }) => ({
  width: 52,
  height: 52,
  marginBottom: 12,
  borderRadius: 14,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.primary.dark,
}));

const StepNumber = styled('span', { name: 'SgForBusiness', slot: 'StepNumber' })(({ theme }) => ({
  width: 36,
  height: 36,
  marginBottom: 12,
  borderRadius: 10,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 800,
}));

const Section = styled('section', { name: 'SgForBusiness', slot: 'Section' })({
  marginTop: 56,
  scrollMarginTop: 96,
});

function ApplicationsStatus({ applications }: { applications: PartnerApplication[] }) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="h5" component="h3">
        {t.myApplications}
      </Typography>
      {applications.map((app) => (
        <Alert
          key={app.id}
          severity={
            app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'error' : 'info'
          }
        >
          <strong>{app.businessName}</strong> · {t.status[app.status]} ·{' '}
          {formatDateTime(app.createdAt)}
          {app.rejectReason && <div>{t.rejectReason(app.rejectReason)}</div>}
        </Alert>
      ))}
    </Stack>
  );
}

export function ForBusinessView() {
  const user = useSessionStore((s) => s.user);
  const ready = useSessionStore((s) => s.ready);
  const [showForm, setShowForm] = useState(false);
  const applications = useQuery({
    queryKey: ['partner', 'applications'],
    queryFn: listMyApplications,
    enabled: Boolean(user),
  });
  const venues = useQuery({
    queryKey: ['partner', 'venues'],
    queryFn: listMyVenues,
    enabled: Boolean(user),
  });

  const list = applications.data ?? [];
  const pending = list.some((a) => a.status === 'submitted');
  const hasVenue = (venues.data?.length ?? 0) > 0;
  const formVisible = !pending && (showForm || !list.length);

  return (
    <main>
      <PageContainer sx={{ pb: 8 }}>
        <Hero>
          <Typography variant="overline" component="p" sx={{ color: 'secondary.main' }}>
            {t.overline}
          </Typography>
          <Typography variant="h1" component="h1" sx={{ maxWidth: 720, my: 2 }}>
            {t.heroTitle}
          </Typography>
          <Typography sx={{ maxWidth: 620, color: 'mint.light' }}>{t.heroText}</Typography>
          <Button
            href="#apply"
            variant="contained"
            size="large"
            endIcon={<ArrowDownwardIcon />}
            sx={{ mt: 3, bgcolor: '#91F2D1', color: '#007058', '&:hover': { bgcolor: '#7FE6C3' } }}
          >
            {t.cta}
          </Button>
        </Hero>

        <Section>
          <SectionHeading title={t.benefitsTitle} size="medium" />
          <Grid $columns={3}>
            {t.benefits.map((benefit, index) => {
              const Icon = BENEFIT_ICONS[index] ?? SpaOutlinedIcon;
              return (
                <Card key={benefit.title}>
                  <IconBox aria-hidden>
                    <Icon />
                  </IconBox>
                  <Typography variant="h5" component="h3">
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.text}
                  </Typography>
                </Card>
              );
            })}
          </Grid>
        </Section>

        <Section>
          <SectionHeading title={t.stepsTitle} size="medium" />
          <Grid $columns={4}>
            {t.steps.map((step, index) => (
              <Card key={step.title}>
                <StepNumber aria-hidden>{index + 1}</StepNumber>
                <Typography variant="h6" component="h3">
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.text}
                </Typography>
              </Card>
            ))}
          </Grid>
        </Section>

        <Section id="apply">
          <SectionHeading title={t.formTitle} size="medium" />
          <Card style={{ maxWidth: 820 }}>
            {!ready || (user && (applications.isPending || venues.isPending)) ? (
              <Skeleton variant="rounded" height={320} />
            ) : (
              <Stack spacing={3}>
                {hasVenue && (
                  <Alert
                    severity="success"
                    action={
                      <Button component={NextLink} href="/partner" color="inherit" size="small">
                        {t.toCabinet}
                      </Button>
                    }
                  >
                    {t.status.approved}
                  </Alert>
                )}
                {list.length > 0 && <ApplicationsStatus applications={list} />}
                {pending && <Alert severity="info">{t.pending}</Alert>}
                {formVisible ? (
                  <ApplicationForm onSubmitted={() => setShowForm(false)} />
                ) : (
                  !pending && (
                    <div>
                      <Button variant="outlined" onClick={() => setShowForm(true)}>
                        {t.cta}
                      </Button>
                    </div>
                  )
                )}
              </Stack>
            )}
          </Card>
        </Section>
      </PageContainer>
    </main>
  );
}
