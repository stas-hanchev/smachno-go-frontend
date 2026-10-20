'use client';

import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import Button from '@mui/material/Button';
import NextLink from 'next/link';
import { ua } from '@/i18n/ua';
import { EmptyState } from './EmptyState';

export function AccessDenied({ text = ua.accessDenied.text }: { text?: string }) {
  return (
    <EmptyState
      icon={<BlockOutlinedIcon />}
      title={ua.accessDenied.title}
      text={text}
      action={
        <Button component={NextLink} href="/" variant="contained">
          {ua.accessDenied.home}
        </Button>
      }
    />
  );
}
