'use client';

import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { ReactNode } from 'react';

const Row = styled('div', { name: 'SgSectionHeading', slot: 'Row' })({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: 16,
  marginBottom: 24,
});

const Overline = styled('span', { name: 'SgSectionHeading', slot: 'Overline' })(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 700,
  letterSpacing: '0.7px',
  textTransform: 'uppercase',
  color: theme.palette.success.main,
  '&::before': {
    content: '""',
    width: 10,
    height: 10,
    borderRadius: 9999,
    backgroundColor: theme.palette.success.main,
  },
}));

export function SectionHeading({
  overline,
  title,
  subtitle,
  action,
  level = 'h2',
  size = 'large',
}: {
  overline?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  level?: 'h1' | 'h2';
  size?: 'large' | 'medium';
}) {
  return (
    <Row>
      <div>
        {overline && <Overline>{overline}</Overline>}
        <Typography variant={size === 'large' ? 'h2' : 'h4'} component={level}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </div>
      {action}
    </Row>
  );
}
