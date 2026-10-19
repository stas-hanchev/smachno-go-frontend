'use client';

import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ua } from '@/i18n/ua';
import { Logo } from './Logo';
import { PageContainer } from './PageContainer';

const Wrapper = styled('footer', { name: 'SgFooter', slot: 'Wrapper' })(({ theme }) => ({
  backgroundColor: theme.palette.mint.light,
  padding: '40px 0',
  [theme.breakpoints.up('md')]: { padding: '48px 0' },
}));

const Grid = styled('div', { name: 'SgFooter', slot: 'Grid' })(({ theme }) => ({
  display: 'grid',
  gap: 24,
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('sm')]: { gridTemplateColumns: '2fr 1fr 1fr' },
  [theme.breakpoints.up('md')]: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
}));

const About = styled('div', { name: 'SgFooter', slot: 'About' })(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  maxWidth: 384,
  [theme.breakpoints.up('md')]: { gridColumn: '1 / span 2' },
}));

const Column = styled('nav', { name: 'SgFooter', slot: 'Column' })({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <MuiLink component={Link} href={href} variant="body2" color="text.secondary">
      {children}
    </MuiLink>
  );
}

const Bottom = styled('div', { name: 'SgFooter', slot: 'Bottom' })({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  paddingTop: 32,
});

const Motto = styled('span', { name: 'SgFooter', slot: 'Motto' })(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 700,
  color: theme.palette.success.main,
  '& svg': { fontSize: 16 },
}));

export function Footer() {
  return (
    <Wrapper>
      <PageContainer>
        <Grid>
          <About>
            <Logo size="small" />
            <Typography variant="body2" color="text.secondary">
              {ua.footer.about}
            </Typography>
          </About>
          <Column aria-label={ua.footer.navigation}>
            <Typography variant="subtitle2">{ua.footer.navigation}</Typography>
            <FooterLink href="/">{ua.nav.home}</FooterLink>
            <FooterLink href="/search">{ua.nav.venues}</FooterLink>
            <FooterLink href="/map">{ua.nav.map}</FooterLink>
          </Column>
          <Column aria-label={ua.footer.account}>
            <Typography variant="subtitle2">{ua.footer.account}</Typography>
            <FooterLink href="/orders">{ua.nav.orders}</FooterLink>
            <FooterLink href="/favorites">{ua.nav.favorites}</FooterLink>
            <FooterLink href="/profile">{ua.nav.profile}</FooterLink>
          </Column>
        </Grid>
        <Bottom>
          <Typography variant="body2" color="text.secondary">
            {ua.footer.copyright(new Date().getFullYear())}
          </Typography>
          <Motto>
            <SpaOutlinedIcon aria-hidden />
            {ua.footer.motto}
          </Motto>
        </Bottom>
      </PageContainer>
    </Wrapper>
  );
}
