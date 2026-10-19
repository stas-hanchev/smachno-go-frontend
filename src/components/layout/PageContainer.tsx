'use client';

import { styled } from '@mui/material/styles';

export const PageContainer = styled('div', { name: 'SgPageContainer', slot: 'PageContainer' })(
  ({ theme }) => ({
    width: '100%',
    maxWidth: 1280,
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: 16,
    paddingRight: 16,
    [theme.breakpoints.up('sm')]: { paddingLeft: 24, paddingRight: 24 },
    [theme.breakpoints.up('md')]: { paddingLeft: 64, paddingRight: 64 },
  }),
);

export const PageMain = styled('main', { name: 'SgPageContainer', slot: 'PageMain' })(
  ({ theme }) => ({
    paddingTop: 24,
    paddingBottom: 48,
    [theme.breakpoints.up('md')]: { paddingTop: 32, paddingBottom: 64 },
  }),
);
