'use client';

import BakeryDiningOutlinedIcon from '@mui/icons-material/BakeryDiningOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ua } from '@/i18n/ua';

const Wrapper = styled('main', { name: 'SgAuthLayout', slot: 'Wrapper' })(({ theme }) => ({
  padding: '24px 0 48px',
  background: `radial-gradient(1200px 400px at 50% 0%, #DCFBF1 0%, ${theme.palette.background.default} 70%)`,
  [theme.breakpoints.up('md')]: { padding: '32px 0 80px' },
}));

const Card = styled('div', { name: 'SgAuthLayout', slot: 'Card' })(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  overflow: 'hidden',
  borderRadius: 24,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0px 24px 48px -12px rgba(15, 92, 86, 0.12)',
  [theme.breakpoints.up('md')]: { gridTemplateColumns: '5fr 7fr' },
}));

const Promo = styled('aside', { name: 'SgAuthLayout', slot: 'Promo' })(({ theme }) => ({
  display: 'none',
  flexDirection: 'column',
  gap: 20,
  padding: 40,
  background: 'linear-gradient(160deg, #E3F8F3 0%, #C9F1E3 100%)',
  [theme.breakpoints.up('md')]: { display: 'flex' },
}));

const Badge = styled('span', { name: 'SgAuthLayout', slot: 'Badge' })(({ theme }) => ({
  alignSelf: 'flex-start',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  borderRadius: 9999,
  backgroundColor: theme.palette.background.paper,
  fontSize: 13,
  lineHeight: '18px',
  fontWeight: 700,
  color: theme.palette.primary.dark,
  '& svg': { fontSize: 16 },
}));

const Photo = styled('div', { name: 'SgAuthLayout', slot: 'Photo' })(({ theme }) => ({
  position: 'relative',
  minHeight: 240,
  borderRadius: 20,
  overflow: 'hidden',
  backgroundImage: 'url("/images/hero-pastry.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1)',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(13,31,28,0) 40%, rgba(13,31,28,0.75) 100%)',
  },
  '& > span': {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: theme.palette.common.white,
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 700,
  },
}));

const FormSide = styled('section', { name: 'SgAuthLayout', slot: 'FormSide' })(({ theme }) => ({
  padding: '28px 20px',
  [theme.breakpoints.up('sm')]: { padding: '40px 48px' },
  [theme.breakpoints.up('md')]: { padding: '48px 64px' },
}));

const Overline = styled('span', { name: 'SgAuthLayout', slot: 'Overline' })(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8,
  fontSize: 13,
  lineHeight: '18px',
  fontWeight: 700,
  letterSpacing: '0.7px',
  textTransform: 'uppercase',
  color: theme.palette.success.main,
  '&::before': {
    content: '""',
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: theme.palette.success.main,
  },
}));

export function AuthLayout({
  overline,
  title,
  subtitle,
  children,
}: {
  overline?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Wrapper>
      <PageContainer>
        <Card>
          <Promo>
            <Badge>
              <VerifiedOutlinedIcon aria-hidden />
              {ua.auth.promoBadge}
            </Badge>
            <Typography variant="h2" component="p" sx={{ color: 'primary.dark' }}>
              {ua.auth.promoTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {ua.auth.promoText}
            </Typography>
            <Photo>
              <span>
                <BakeryDiningOutlinedIcon aria-hidden />
                {ua.auth.promoCaption}
              </span>
            </Photo>
          </Promo>
          <FormSide>
            {overline && <Overline>{overline}</Overline>}
            <Typography variant="h2" component="h1" sx={{ mb: 1 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {subtitle}
              </Typography>
            )}
            {children}
          </FormSide>
        </Card>
      </PageContainer>
    </Wrapper>
  );
}
