'use client';

import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { errorMessage } from '@/api/client';
import { getNotificationSettings, updateNotificationSettings } from '@/api/me';
import type { NotificationSettings } from '@/api/types';
import { ProfilePanel } from '@/components/profile/ProfilePanel';
import { ua } from '@/i18n/ua';
import { notify } from '@/stores/notify';

type SettingKey = Exclude<keyof NotificationSettings, 'pushEnabled'>;

const t = ua.notificationSettings;

const ITEMS: { key: SettingKey; title: string; text: string }[] = [
  { key: 'emailEnabled', title: t.emailEnabled, text: t.emailEnabledText },
  { key: 'orderUpdates', title: t.orderUpdates, text: t.orderUpdatesText },
  { key: 'pickupReminders', title: t.pickupReminders, text: t.pickupRemindersText },
  { key: 'favoritesNewListings', title: t.favoritesNewListings, text: t.favoritesNewListingsText },
  { key: 'marketing', title: t.marketing, text: t.marketingText },
];

const Row = styled('label', { name: 'SgProfileNotifications', slot: 'Row' })(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: 16,
  borderRadius: 16,
  backgroundColor: theme.palette.mint.light,
  cursor: 'pointer',
}));

export default function NotificationSettingsPage() {
  const queryClient = useQueryClient();
  const settings = useQuery({
    queryKey: ['notification-settings'],
    queryFn: getNotificationSettings,
  });
  const update = useMutation({
    mutationFn: updateNotificationSettings,
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ['notification-settings'] });
      const previous = queryClient.getQueryData<NotificationSettings>(['notification-settings']);
      if (previous) queryClient.setQueryData(['notification-settings'], { ...previous, ...patch });
      return { previous };
    },
    onError: (error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(['notification-settings'], context.previous);
      notify.error(errorMessage(error));
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notification-settings'], data);
      notify.success(ua.common.saved);
    },
  });

  return (
    <ProfilePanel title={t.title} subtitle={t.subtitle}>
      {settings.isPending && <Skeleton variant="rounded" height={320} />}
      {settings.isError && <Alert severity="error">{errorMessage(settings.error)}</Alert>}
      {settings.data && (
        <Stack spacing={1.5}>
          {ITEMS.map((item) => {
            const disabled = item.key !== 'emailEnabled' && !settings.data.emailEnabled;
            return (
              <Row key={item.key} style={{ opacity: disabled ? 0.6 : 1 }}>
                <div>
                  <Typography variant="subtitle2">{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.text}
                  </Typography>
                </div>
                <Switch
                  checked={settings.data[item.key]}
                  disabled={disabled}
                  onChange={(e) => update.mutate({ [item.key]: e.target.checked })}
                  slotProps={{ input: { 'aria-label': item.title } }}
                />
              </Row>
            );
          })}
        </Stack>
      )}
    </ProfilePanel>
  );
}
