import { api } from './client';
import type { AppNotification, FavoriteVenue, NotificationSettings, User } from './types';

export interface ProfilePatch {
  firstName?: string;
  lastName?: string | null;
  phone?: string | null;
  homeLat?: number | null;
  homeLng?: number | null;
  homeAddress?: string | null;
  searchRadiusKm?: number;
  cityId?: number | null;
}

export async function getMe() {
  const { data } = await api.get<User>('/me');
  return data;
}

export async function updateMe(patch: ProfilePatch) {
  const { data } = await api.patch<User>('/me', patch);
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await api.patch('/me/password', { currentPassword, newPassword });
}

export async function listNotifications() {
  const { data } = await api.get<{ data: AppNotification[]; unread: number }>('/me/notifications', {
    params: { limit: 20 },
  });
  return data;
}

export async function markNotificationsRead(ids?: number[]) {
  await api.post('/me/notifications/read', ids ? { ids } : {});
}

export async function getNotificationSettings() {
  const { data } = await api.get<NotificationSettings>('/me/notification-settings');
  return data;
}

export async function updateNotificationSettings(patch: Partial<NotificationSettings>) {
  const { data } = await api.patch<NotificationSettings>('/me/notification-settings', patch);
  return data;
}

export async function listFavorites() {
  const { data } = await api.get<FavoriteVenue[]>('/favorites');
  return data;
}

export async function addFavorite(venueId: number, notifyNewListings?: boolean) {
  await api.put(
    `/favorites/${venueId}`,
    notifyNewListings === undefined ? {} : { notifyNewListings },
  );
}

export async function removeFavorite(venueId: number) {
  await api.delete(`/favorites/${venueId}`);
}
