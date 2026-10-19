'use client';

import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { shadows } from '@/theme/theme';

const Panel = styled('section', { name: 'SgProfilePanel', slot: 'Panel' })(({ theme }) => ({
  padding: 24,
  borderRadius: 24,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
  [theme.breakpoints.up('md')]: { padding: 28 },
}));

const Head = styled('div', { name: 'SgProfilePanel', slot: 'Head' })({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 20,
});

export function ProfilePanel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Panel>
      <Head>
        <div>
          <Typography variant="h4" component="h2">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </div>
        {action}
      </Head>
      {children}
    </Panel>
  );
}
