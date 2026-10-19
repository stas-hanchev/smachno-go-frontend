'use client';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from 'next/link';
import { useState } from 'react';
import { useLogout } from '@/hooks/useLogout';
import { ua } from '@/i18n/ua';
import { initials } from '@/lib/user';
import { useSessionStore } from '@/stores/session';

export function UserMenu() {
  const user = useSessionStore((s) => s.user);
  const ready = useSessionStore((s) => s.ready);
  const logout = useLogout();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  if (!ready) return null;
  if (!user) {
    return (
      <Button component={Link} href="/login" variant="contained" color="primary">
        {ua.nav.login}
      </Button>
    );
  }

  return (
    <>
      <IconButton
        aria-label={ua.nav.accountMenu}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ p: 0.5 }}
      >
        <Avatar
          src={user.avatarUrl ?? undefined}
          sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: 13, fontWeight: 700 }}
        >
          {initials(user.firstName, user.lastName)}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={anchor !== null}
        onClose={() => setAnchor(null)}
        onClick={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled sx={{ opacity: '1 !important' }}>
          <ListItemText
            primary={`${user.firstName} ${user.lastName ?? ''}`.trim()}
            secondary={user.email}
          />
        </MenuItem>
        <Divider />
        <MenuItem component={Link} href="/profile">
          {ua.nav.profile}
        </MenuItem>
        <MenuItem component={Link} href="/orders">
          {ua.nav.orders}
        </MenuItem>
        <MenuItem component={Link} href="/favorites">
          {ua.nav.favorites}
        </MenuItem>
        <MenuItem component={Link} href="/profile/settings">
          {ua.nav.settings}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => void logout()}>{ua.nav.logout}</MenuItem>
      </Menu>
    </>
  );
}
