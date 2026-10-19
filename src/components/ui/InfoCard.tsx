'use client';

import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { shadows } from '@/theme/theme';

const Card = styled('div', { name: 'SgInfoCard', slot: 'Card' })(({ theme }) => ({
  display: 'flex',
  gap: 16,
  padding: 20,
  borderRadius: 20,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
}));

const Icon = styled('span', { name: 'SgInfoCard', slot: 'Icon' })(({ theme }) => ({
  width: 44,
  height: 44,
  flexShrink: 0,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.mint.light,
  color: theme.palette.success.main,
}));

export function InfoCard({
  icon,
  label,
  value,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Card>
      <Icon aria-hidden>{icon}</Icon>
      <div style={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" component="p">
          {value}
        </Typography>
        {children}
      </div>
    </Card>
  );
}
