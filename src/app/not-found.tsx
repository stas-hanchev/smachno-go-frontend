'use client';

import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import Button from '@mui/material/Button';
import NextLink from 'next/link';
import { PageContainer, PageMain } from '@/components/layout/PageContainer';
import { EmptyState } from '@/components/ui/EmptyState';
import { ua } from '@/i18n/ua';

export default function NotFound() {
  return (
    <PageMain>
      <PageContainer sx={{ maxWidth: 720 }}>
        <EmptyState
          icon={<SearchOffOutlinedIcon />}
          title={ua.notFound.title}
          text={ua.notFound.text}
          action={
            <Button component={NextLink} href="/" variant="contained">
              {ua.notFound.home}
            </Button>
          }
        />
      </PageContainer>
    </PageMain>
  );
}
