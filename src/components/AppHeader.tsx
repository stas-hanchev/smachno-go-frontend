'use client';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { logout } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';

export function AppHeader() {
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.ready);
  const queryClient = useQueryClient();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      useAuthStore.getState().clear();
      queryClient.clear();
    }
  }

  return (
    <AppBar position="sticky" color="inherit" elevation={0}>
      <Toolbar sx={{ gap: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography
          component={Link}
          href="/"
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main', textDecoration: 'none' }}
        >
          СмачноGo
        </Typography>
        {ready &&
          (user ? (
            <>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user.firstName}
              </Typography>
              <Button onClick={handleLogout}>Вийти</Button>
            </>
          ) : (
            <Button component={Link} href="/login" variant="contained">
              Увійти
            </Button>
          ))}
      </Toolbar>
    </AppBar>
  );
}
