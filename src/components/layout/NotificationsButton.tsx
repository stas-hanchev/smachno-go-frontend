'use client';

import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { listNotifications, markNotificationsRead } from '@/api/me';
import { ua } from '@/i18n/ua';
import { formatDateTime } from '@/lib/format';

export function NotificationsButton() {
  const queryClient = useQueryClient();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const notifications = useQuery({ queryKey: ['notifications'], queryFn: listNotifications });
  const markAll = useMutation({
    mutationFn: () => markNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = notifications.data?.unread ?? 0;
  const items = notifications.data?.data ?? [];

  return (
    <>
      <IconButton
        aria-label={ua.notifications.open}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ bgcolor: 'mint.light', width: 40, height: 40, '&:hover': { bgcolor: '#D3F1EA' } }}
      >
        <Badge color="error" variant="dot" invisible={unread === 0}>
          <NotificationsNoneOutlinedIcon fontSize="small" sx={{ color: 'text.primary' }} />
        </Badge>
      </IconButton>
      <Popover
        open={anchor !== null}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 340, maxHeight: 440, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {ua.notifications.title}
          </Typography>
          {unread > 0 && (
            <Button size="small" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
              {ua.notifications.markAllRead}
            </Button>
          )}
        </Box>
        <Divider />
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            {ua.notifications.empty}
          </Typography>
        ) : (
          items.map((n) => (
            <Box
              key={n.id}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: n.readAt ? 'transparent' : 'mint.light',
              }}
            >
              <Typography variant="subtitle2">{n.title}</Typography>
              {n.body && (
                <Typography variant="body2" color="text.secondary">
                  {n.body}
                </Typography>
              )}
              <Typography variant="caption" sx={{ color: 'muted' }}>
                {formatDateTime(n.createdAt)}
              </Typography>
            </Box>
          ))
        )}
      </Popover>
    </>
  );
}
