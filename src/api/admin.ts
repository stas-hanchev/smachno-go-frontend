import { api } from './client';
import type {
  AdminApplicationDetails,
  AdminOrderDetails,
  AdminOrderRow,
  AdminUserRow,
  AdminVenueRow,
  ApplicationStatus,
  AuditEntry,
  BusinessSettings,
  DictionaryItem,
  DictionaryName,
  OrderStatus,
  Paginated,
  PartnerApplication,
  RecommendationWeights,
  UserRole,
  VenueStatus,
} from './types';

export interface PageQuery {
  page: number;
  limit: number;
}

function clean<T extends object>(query: T) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
  );
}

export async function listApplications(query: PageQuery & { status?: ApplicationStatus }) {
  const { data } = await api.get<Paginated<PartnerApplication>>('/admin/applications', {
    params: clean(query),
  });
  return data;
}

export async function getApplication(id: number) {
  const { data } = await api.get<AdminApplicationDetails>(`/admin/applications/${id}`);
  return data;
}

export async function approveApplication(
  id: number,
  input: { categoryId: number; cityId: number; name?: string; commissionRate?: number },
) {
  const { data } = await api.post(`/admin/applications/${id}/approve`, input);
  return data;
}

export async function rejectApplication(id: number, reason: string) {
  const { data } = await api.post(`/admin/applications/${id}/reject`, { reason });
  return data;
}

export async function listVenues(
  query: PageQuery & { q?: string; status?: VenueStatus; cityId?: number },
) {
  const { data } = await api.get<Paginated<AdminVenueRow>>('/admin/venues', {
    params: clean(query),
  });
  return data;
}

export async function updateVenue(
  id: number,
  patch: { status?: Exclude<VenueStatus, 'draft'>; commissionRate?: number },
) {
  const { data } = await api.patch(`/admin/venues/${id}`, patch);
  return data;
}

export async function listUsers(
  query: PageQuery & { q?: string; role?: UserRole; status?: AdminUserRow['status'] },
) {
  const { data } = await api.get<Paginated<AdminUserRow>>('/admin/users', {
    params: clean(query),
  });
  return data;
}

export async function updateUser(
  id: number,
  patch: { status?: 'active' | 'blocked'; role?: UserRole },
) {
  const { data } = await api.patch(`/admin/users/${id}`, patch);
  return data;
}

export async function listOrders(
  query: PageQuery & { q?: string; status?: OrderStatus; date?: string },
) {
  const { data } = await api.get<Paginated<AdminOrderRow>>('/admin/orders', {
    params: clean(query),
  });
  return data;
}

export async function getOrder(publicId: string) {
  const { data } = await api.get<AdminOrderDetails>(`/admin/orders/${publicId}`);
  return data;
}

export async function refundOrder(publicId: string, reason: string) {
  const { data } = await api.post(`/admin/orders/${publicId}/refund`, { reason });
  return data;
}

export async function listDictionary(name: DictionaryName) {
  const { data } = await api.get<DictionaryItem[]>(`/admin/${name}`);
  return data;
}

export async function createDictionaryItem(name: DictionaryName, input: Partial<DictionaryItem>) {
  const { data } = await api.post<DictionaryItem>(`/admin/${name}`, input);
  return data;
}

export async function updateDictionaryItem(
  name: DictionaryName,
  id: number,
  patch: Partial<DictionaryItem>,
) {
  const { data } = await api.patch<DictionaryItem>(`/admin/${name}/${id}`, patch);
  return data;
}

export async function deleteDictionaryItem(name: DictionaryName, id: number) {
  await api.delete(`/admin/${name}/${id}`);
}

export async function getSettings() {
  const { data } = await api.get<BusinessSettings>('/admin/settings');
  return data;
}

export async function updateSettings(patch: Partial<BusinessSettings>) {
  const { data } = await api.put<BusinessSettings>('/admin/settings', patch);
  return data;
}

export async function getRecommendationWeights() {
  const { data } = await api.get<RecommendationWeights>('/admin/settings/recommendations');
  return data;
}

export async function updateRecommendationWeights(patch: Partial<RecommendationWeights>) {
  const { data } = await api.put<RecommendationWeights>('/admin/settings/recommendations', patch);
  return data;
}

export async function listAuditLog(
  query: PageQuery & { entityType?: string; action?: string; actorId?: number },
) {
  const { data } = await api.get<Paginated<AuditEntry>>('/admin/audit-log', {
    params: clean(query),
  });
  return data;
}
