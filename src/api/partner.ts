import { api } from './client';
import type {
  ApplicationInput,
  OfferInput,
  OfferStatus,
  OrderStatus,
  PartnerApplication,
  PartnerListing,
  PartnerOffer,
  PartnerVenue,
  TeamInvite,
  TeamMember,
  VenueOrder,
  VenueProfile,
} from './types';

const venuePath = (venueId: number) => `/partner/venues/${venueId}`;

export async function listMyVenues() {
  const { data } = await api.get<PartnerVenue[]>('/partner/venues');
  return data;
}

export async function submitApplication(input: ApplicationInput) {
  const { data } = await api.post<PartnerApplication>('/partner/applications', input);
  return data;
}

export async function listMyApplications() {
  const { data } = await api.get<PartnerApplication[]>('/partner/applications/mine');
  return data;
}

export async function acceptInvite(token: string) {
  const { data } = await api.post<PartnerVenue>('/partner/invites/accept', { token });
  return data;
}

export async function getVenueProfile(venueId: number) {
  const { data } = await api.get<VenueProfile>(venuePath(venueId));
  return data;
}

export interface VenueProfilePatch {
  name?: string;
  description?: string | null;
  categoryId?: number;
  cityId?: number;
  address?: string;
  lat?: number;
  lng?: number;
  phone?: string | null;
  legalName?: string;
  taxId?: string;
  iban?: string;
}

export async function updateVenueProfile(venueId: number, patch: VenueProfilePatch) {
  const { data } = await api.patch<VenueProfile>(venuePath(venueId), patch);
  return data;
}

export interface HoursInput {
  weekday: number;
  opensAt?: string;
  closesAt?: string;
  isClosed: boolean;
}

export async function setVenueHours(venueId: number, hours: HoursInput[]) {
  const { data } = await api.put<VenueProfile>(`${venuePath(venueId)}/hours`, { hours });
  return data;
}

export async function addClosure(venueId: number, date: string, reason?: string) {
  await api.post(`${venuePath(venueId)}/closures`, { date, reason });
}

export async function deleteClosure(venueId: number, closureId: number) {
  await api.delete(`${venuePath(venueId)}/closures/${closureId}`);
}

export async function activateVenue(venueId: number) {
  const { data } = await api.post<VenueProfile>(`${venuePath(venueId)}/activate`);
  return data;
}

function imageForm(file: File) {
  const form = new FormData();
  form.append('file', file);
  return form;
}

export type VenueImageKind = 'logo' | 'cover';

export async function uploadVenueImage(venueId: number, kind: VenueImageKind, file: File) {
  const { data } = await api.post<{ url: string }>(
    `${venuePath(venueId)}/${kind}`,
    imageForm(file),
  );
  return data;
}

export async function removeVenueImage(venueId: number, kind: VenueImageKind) {
  await api.delete(`${venuePath(venueId)}/${kind}`);
}

export async function addVenuePhoto(venueId: number, file: File) {
  const { data } = await api.post<VenueProfile['photos']>(
    `${venuePath(venueId)}/photos`,
    imageForm(file),
  );
  return data;
}

export async function deleteVenuePhoto(venueId: number, photoId: number) {
  const { data } = await api.delete<VenueProfile['photos']>(
    `${venuePath(venueId)}/photos/${photoId}`,
  );
  return data;
}

export async function listOffers(venueId: number, status?: OfferStatus) {
  const { data } = await api.get<PartnerOffer[]>(`${venuePath(venueId)}/offers`, {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function createOffer(venueId: number, input: OfferInput) {
  const { data } = await api.post<PartnerOffer>(`${venuePath(venueId)}/offers`, input);
  return data;
}

export async function updateOffer(
  venueId: number,
  offerId: number,
  patch: Partial<OfferInput> & { status?: 'active' | 'paused' },
) {
  const { data } = await api.patch<PartnerOffer>(`${venuePath(venueId)}/offers/${offerId}`, patch);
  return data;
}

export async function archiveOffer(venueId: number, offerId: number) {
  await api.delete(`${venuePath(venueId)}/offers/${offerId}`);
}

export async function uploadOfferPhoto(venueId: number, offerId: number, file: File) {
  const { data } = await api.post<{ url: string }>(
    `${venuePath(venueId)}/offers/${offerId}/photo`,
    imageForm(file),
  );
  return data;
}

export async function removeOfferPhoto(venueId: number, offerId: number) {
  await api.delete(`${venuePath(venueId)}/offers/${offerId}/photo`);
}

export async function listListings(venueId: number, date?: string) {
  const { data } = await api.get<PartnerListing[]>(`${venuePath(venueId)}/listings`, {
    params: date ? { date } : undefined,
  });
  return data;
}

export interface ListingInput {
  offerId: number;
  date: string;
  pickupStart: string;
  pickupEnd: string;
  quantity: number;
}

export async function createListing(venueId: number, input: ListingInput) {
  const { data } = await api.post<PartnerListing>(`${venuePath(venueId)}/listings`, input);
  return data;
}

export async function updateListing(
  venueId: number,
  listingId: number,
  patch: { quantityTotal?: number; pickupStart?: string; pickupEnd?: string },
) {
  const { data } = await api.patch<PartnerListing>(
    `${venuePath(venueId)}/listings/${listingId}`,
    patch,
  );
  return data;
}

export async function closeListing(venueId: number, listingId: number) {
  const { data } = await api.post<PartnerListing>(
    `${venuePath(venueId)}/listings/${listingId}/close`,
  );
  return data;
}

export async function cancelListing(venueId: number, listingId: number, reason: string) {
  await api.post(`${venuePath(venueId)}/listings/${listingId}/cancel`, { reason });
}

export async function listVenueOrders(venueId: number, date?: string, status?: OrderStatus) {
  const { data } = await api.get<VenueOrder[]>(`${venuePath(venueId)}/orders`, {
    params: { ...(date ? { date } : {}), ...(status ? { status } : {}) },
  });
  return data;
}

export async function verifyPickup(venueId: number, input: { code: string } | { qrToken: string }) {
  const { data } = await api.post<VenueOrder>(`${venuePath(venueId)}/pickups/verify`, input);
  return data;
}

export async function pickupOrder(venueId: number, publicId: string) {
  const { data } = await api.post<VenueOrder>(`${venuePath(venueId)}/orders/${publicId}/pickup`);
  return data;
}

export async function cancelVenueOrder(venueId: number, publicId: string, reason: string) {
  await api.post(`${venuePath(venueId)}/orders/${publicId}/cancel`, { reason });
}

export async function listTeam(venueId: number) {
  const { data } = await api.get<{ members: TeamMember[]; invites: TeamInvite[] }>(
    `${venuePath(venueId)}/members`,
  );
  return data;
}

export async function inviteMember(venueId: number, email: string) {
  const { data } = await api.post<TeamInvite>(`${venuePath(venueId)}/members/invite`, { email });
  return data;
}

export async function revokeInvite(venueId: number, inviteId: number) {
  await api.delete(`${venuePath(venueId)}/invites/${inviteId}`);
}

export async function setMemberStatus(
  venueId: number,
  userId: number,
  status: 'active' | 'disabled',
) {
  await api.patch(`${venuePath(venueId)}/members/${userId}`, { status });
}

export async function removeMember(venueId: number, userId: number) {
  await api.delete(`${venuePath(venueId)}/members/${userId}`);
}
