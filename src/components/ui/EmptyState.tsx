'use client';

import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { ReactNode } from 'react';

const Wrapper = styled('div', { name: 'SgEmptyState', slot: 'Wrapper' })(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: 12,
  padding: '48px 24px',
  borderRadius: 24,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
}));

const IconCircle = styled('div', { name: 'SgEmptyState', slot: 'IconCircle' })(({ theme }) => ({
  width: 72,
  height: 72,
  borderRadius: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.mint.light,
  color: theme.palette.success.main,
  '& svg': { fontSize: 36 },
}));

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <Wrapper>
      <IconCircle aria-hidden>{icon}</IconCircle>
      <Typography variant="h4" component="h2">
        {title}
      </Typography>
      {text && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440 }}>
          {text}
        </Typography>
      )}
      {action}
    </Wrapper>
  );
}
