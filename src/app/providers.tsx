'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { refreshSession } from '@/api/client';
import { StyledComponentsRegistry } from '@/lib/styled-registry';
import { useAuthStore } from '@/stores/auth';
import { theme } from '@/theme/theme';

function SessionBootstrap() {
  useEffect(() => {
    void refreshSession().finally(() => useAuthStore.getState().markReady());
  }, []);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
      }),
  );

  return (
    <StyledComponentsRegistry>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <SessionBootstrap />
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}
