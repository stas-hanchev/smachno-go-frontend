'use client';

import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { shadows } from '@/theme/theme';

const Card = styled('div', { name: 'SgStatCard', slot: 'Card' })(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: 18,
  borderRadius: 20,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
}));

const Icon = styled('span', { name: 'SgStatCard', slot: 'Icon' })(({ theme }) => ({
  width: 48,
  height: 48,
  flexShrink: 0,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.primary.dark,
}));

export const StatGrid = styled('div', { name: 'SgStatCard', slot: 'Grid' })(({ theme }) => ({
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  [theme.breakpoints.up('lg')]: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
}));

export function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <Icon aria-hidden>{icon}</Icon>
      <div style={{ minWidth: 0 }}>
        <Typography variant="h4" component="p">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </div>
    </Card>
  );
}
