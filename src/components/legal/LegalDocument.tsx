'use client';

import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import { PageContainer, PageMain } from '@/components/layout/PageContainer';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ua } from '@/i18n/ua';
import { publicEnv } from '@/lib/env';
import { shadows } from '@/theme/theme';

type LegalKind = 'terms' | 'privacy';

const OTHER: Record<LegalKind, { href: string; title: string }> = {
  terms: { href: '/privacy', title: ua.legal.privacy.title },
  privacy: { href: '/terms', title: ua.legal.terms.title },
};

const Layout = styled('div', { name: 'SgLegalDocument', slot: 'Layout' })(({ theme }) => ({
  display: 'grid',
  gap: 24,
  alignItems: 'start',
  [theme.breakpoints.up('md')]: { gridTemplateColumns: '260px minmax(0, 1fr)', gap: 32 },
}));

const Contents = styled('nav', { name: 'SgLegalDocument', slot: 'Contents' })(({ theme }) => ({
  padding: 20,
  borderRadius: 20,
  backgroundColor: theme.palette.mint.light,
  [theme.breakpoints.up('md')]: { position: 'sticky', top: 96 },
  '& ol': { margin: '12px 0 0', paddingLeft: 20, display: 'grid', gap: 8, fontSize: 14 },
}));

const Article = styled('article', { name: 'SgLegalDocument', slot: 'Article' })(({ theme }) => ({
  padding: 24,
  borderRadius: 24,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
  maxWidth: 820,
  [theme.breakpoints.up('md')]: { padding: 40 },
  '& section': { scrollMarginTop: 96 },
  '& section + section': { marginTop: 32 },
  '& section p': { marginTop: 12 },
}));

const sectionId = (index: number) => `section-${index + 1}`;

export function LegalDocument({ kind }: { kind: LegalKind }) {
  const doc = ua.legal[kind];
  const other = OTHER[kind];

  return (
    <PageMain>
      <PageContainer>
        <SectionHeading level="h1" title={doc.title} subtitle={ua.legal.updated} />
        <Layout>
          <Contents aria-label={ua.legal.contents}>
            <Typography variant="subtitle2">{ua.legal.contents}</Typography>
            <ol>
              {doc.sections.map((section, index) => (
                <li key={section.heading}>
                  <MuiLink href={`#${sectionId(index)}`} variant="body2" color="text.secondary">
                    {section.heading}
                  </MuiLink>
                </li>
              ))}
            </ol>
          </Contents>
          <Article>
            <Typography>{doc.intro}</Typography>
            {doc.sections.map((section, index) => (
              <section key={section.heading} id={sectionId(index)}>
                <Typography variant="h5" component="h2" sx={{ mt: 4 }}>
                  {index + 1}. {section.heading}
                </Typography>
                {section.paragraphs.map((paragraph) => (
                  <Typography key={paragraph} color="text.secondary">
                    {paragraph}
                  </Typography>
                ))}
              </section>
            ))}
            <section>
              <Typography variant="h5" component="h2" sx={{ mt: 4 }}>
                {ua.legal.contactTitle}
              </Typography>
              <Typography color="text.secondary">
                {ua.legal.contactText}
                <MuiLink href={`mailto:${publicEnv.supportEmail}`}>
                  {publicEnv.supportEmail}
                </MuiLink>
                .
              </Typography>
              <Typography color="text.secondary">
                {ua.legal.seeAlso}:{' '}
                <MuiLink component={Link} href={other.href}>
                  {other.title}
                </MuiLink>
                .
              </Typography>
            </section>
          </Article>
        </Layout>
      </PageContainer>
    </PageMain>
  );
}
