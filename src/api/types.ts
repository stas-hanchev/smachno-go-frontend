export type UserRole = 'customer' | 'admin' | 'super_admin';

export interface User {
  id: number;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  homeLat: number | null;
  homeLng: number | null;
  homeAddress: string | null;
  searchRadiusKm: number;
  cityId: number | null;
}

export interface Session {
  accessToken: string;
  user: User;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

export interface City {
  id: number;
  name: string;
  slug: string;
  centerLat: number;
  centerLng: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  activeListings?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface ListingCard {
  id: number;
  offer: {
    id: number;
    title: string;
    photoUrl: string | null;
    category: { id: number; name: string };
    tags: string[];
  };
  venue: {
    id: number;
    slug: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    ratingAvg: string | null;
    ratingCount: number;
  };
  price: string;
  originalPrice: string;
  discountPercent: number;
  quantityLeft: number;
  quantityTotal: number;
  status: string;
  pickupStart: string;
  pickupEnd: string;
  distanceM: number | null;
  isFavoriteVenue: boolean;
}

export interface VenueHours {
  weekday: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}

export interface ListingDetails {
  id: number;
  status: string;
  pickupDate: string;
  pickupStart: string;
  pickupEnd: string;
  price: string;
  originalPrice: string;
  savingAmount: string;
  discountPercent: number;
  quantityLeft: number;
  quantityTotal: number;
  maxPerOrder: number;
  salesCloseAt: string;
  offer: {
    id: number;
    title: string;
    description: string | null;
    photoUrl: string | null;
    category: { id: number; name: string; slug: string };
    tags: Tag[];
    allergens: Tag[];
  };
  ecoImpact: { note: string; weightKg: number; co2Kg: number };
  venue: {
    id: number;
    slug: string;
    name: string;
    address: string;
    phone: string | null;
    lat: number;
    lng: number;
    logoUrl: string | null;
    ratingAvg: string | null;
    ratingCount: number;
    hours: VenueHours[];
    isFavorite: boolean;
  };
  distanceM: number | null;
}

export interface VenueDetails {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  category: { id: number; name: string; slug: string };
  city: { id: number; name: string; slug: string };
  address: string;
  lat: number;
  lng: number;
  phone: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  photos: string[];
  ratingAvg: string | null;
  ratingCount: number;
  isNew: boolean;
  hours: VenueHours[];
  distanceM: number | null;
  isFavorite: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

export type ListingSort = 'distance' | 'rating' | 'discount' | 'price' | 'pickup';
export type PickupFilter = 'now' | 'today' | 'tonight' | 'tomorrow';

export interface ListingSearch {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  q?: string;
  categoryIds?: number[];
  tagIds?: number[];
  priceMin?: number;
  priceMax?: number;
  pickup?: PickupFilter;
  availableOnly?: boolean;
  sort?: ListingSort;
  page?: number;
  limit?: number;
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'picked_up'
  | 'cancelled_by_customer'
  | 'cancelled_by_venue'
  | 'expired'
  | 'no_show'
  | 'refunded';

export interface Order {
  publicId: string;
  status: OrderStatus;
  quantity: number;
  unitPrice: string;
  unitOriginalPrice: string;
  totalAmount: string;
  savingAmount: string;
  reservedUntil: string;
  pickupDate: string;
  pickupStart: string;
  pickupEnd: string;
  pickedUpAt: string | null;
  cancelReason: string | null;
  listingId: number;
  offer: { id: number; title: string; photoUrl: string | null };
  venue: {
    id: number;
    slug: string;
    name: string;
    address: string;
    phone: string | null;
    lat: number;
    lng: number;
  };
  hasVoucher: boolean;
  createdAt: string;
}

export interface Voucher {
  qrToken: string;
  code: string;
  validUntil: string;
}

export interface OrderDetails extends Order {
  statusHistory: { from: OrderStatus | null; to: OrderStatus; at: string }[];
  voucher: Voucher | null;
}

export interface CheckoutParams {
  provider: 'fake' | 'liqpay';
  checkoutUrl: string;
  method: 'GET' | 'POST';
  data?: string;
  signature?: string;
}

export interface CreateOrderResult {
  order: Order;
  payment: CheckoutParams | null;
}

export interface FavoriteVenue {
  venue: {
    id: number;
    slug: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    logoUrl: string | null;
    category: { id: number; name: string };
    ratingAvg: string | null;
    ratingCount: number;
  };
  activeListings: number;
  notifyNewListings: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  orderUpdates: boolean;
  pickupReminders: boolean;
  favoritesNewListings: boolean;
  marketing: boolean;
}

export interface ListingUpdate {
  listingId: number;
  quantityLeft: number;
  quantityTotal: number;
  status: string;
}

export type VenueStatus = 'draft' | 'active' | 'paused' | 'blocked';
export type MemberRole = 'owner' | 'staff';
export type OfferStatus = 'active' | 'paused' | 'archived';
export type ListingStatus = 'scheduled' | 'on_sale' | 'sold_out' | 'closed' | 'cancelled';
export type ApplicationStatus = 'submitted' | 'approved' | 'rejected';

export interface PartnerVenue {
  id: number;
  slug: string;
  name: string;
  address: string;
  status: VenueStatus;
  role: MemberRole;
}

export interface VenueProfile {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  category: { id: number; name: string };
  city: { id: number; name: string };
  address: string;
  lat: number;
  lng: number;
  phone: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  photos: { id: number; url: string; sortOrder: number }[];
  legalName: string;
  taxId: string;
  iban: string;
  commissionRate: number;
  status: VenueStatus;
  hours: VenueHours[];
  closures: { id: number; date: string; reason: string | null }[];
  activation: { ready: boolean; missing: { field: string; message: string }[] };
}

export interface PartnerOffer {
  id: number;
  venueId: number;
  title: string;
  description: string | null;
  photoUrl: string | null;
  category: { id: number; name: string };
  originalPrice: string;
  price: string;
  estWeightKg: number;
  maxPerOrder: number;
  status: OfferStatus;
  tags: { id: number; name: string }[];
  allergens: { id: number; name: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface OfferInput {
  title: string;
  description?: string | null;
  categoryId: number;
  originalPrice: number;
  price: number;
  estWeightKg?: number;
  maxPerOrder?: number;
  tagIds?: number[];
  allergenIds?: number[];
}

export interface PartnerListing {
  id: number;
  offerId: number;
  offerTitle: string;
  pickupDate: string;
  pickupStart: string;
  pickupEnd: string;
  price: string;
  originalPrice: string;
  discountPercent: number;
  quantityTotal: number;
  quantityLeft: number;
  quantitySold: number;
  status: ListingStatus;
  source: string;
  cancelReason: string | null;
}

export interface VenueOrder {
  publicId: string;
  status: OrderStatus;
  customerName: string;
  offerTitle: string;
  listingId: number;
  quantity: number;
  totalAmount: string;
  pickupDate: string;
  pickupStart: string;
  pickupEnd: string;
  voucherCode: string | null;
  voucherValidUntil: string | null;
  pickedUpAt: string | null;
  createdAt: string;
}

export interface TeamMember {
  userId: number;
  email: string;
  firstName: string;
  lastName: string | null;
  role: MemberRole;
  status: 'invited' | 'active' | 'disabled';
  createdAt: string;
}

export interface TeamInvite {
  id: number;
  email: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface PartnerApplication {
  id: number;
  userId: number;
  businessName: string;
  venueType: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  legalName: string;
  taxId: string;
  iban: string;
  venuesCount: number;
  status: ApplicationStatus;
  rejectReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface ApplicationInput {
  businessName: string;
  venueType: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  legalName: string;
  taxId: string;
  iban: string;
  venuesCount?: number;
}

export interface AdminApplicationDetails extends PartnerApplication {
  applicant: { id: number; email: string; firstName: string; lastName: string | null };
  venues: { id: number; name: string; slug: string; status: VenueStatus }[];
}

export interface AdminVenueRow {
  id: number;
  slug: string;
  name: string;
  city: string;
  address: string;
  status: VenueStatus;
  commissionRate: number;
  ratingAvg: string | null;
  ratingCount: number;
  createdAt: string;
}

export interface AdminUserRow extends User {
  status: 'active' | 'blocked' | 'deleted';
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminOrderRow {
  publicId: string;
  status: OrderStatus;
  customerEmail: string;
  venue: { id: number; name: string };
  offerTitle: string;
  quantity: number;
  totalAmount: string;
  voucherCode: string | null;
  pickupDate: string;
  pickupStart: string;
  createdAt: string;
}

export interface AdminOrderDetails extends Omit<AdminOrderRow, 'customerEmail'> {
  customer: { id: number; email: string; name: string };
  listingId: number;
  unitPrice: string;
  commissionAmount: string;
  voucherStatus: string | null;
  pickupEnd: string;
  pickedUpAt: string | null;
  cancelReason: string | null;
  statusHistory: {
    from: OrderStatus | null;
    to: OrderStatus;
    actorType: string;
    actorId: number | null;
    note: string | null;
    at: string;
  }[];
  payments: {
    id: number;
    provider: string;
    providerOrderId: string;
    amount: string;
    method: string | null;
    status: string;
    paidAt: string | null;
    createdAt: string;
    refunds: {
      id: number;
      amount: string;
      reason: string | null;
      status: string;
      createdAt: string;
    }[];
  }[];
}

export type DictionaryName = 'categories' | 'tags' | 'allergens' | 'cities';

export interface DictionaryItem {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  centerLat?: number;
  centerLng?: number;
}

export interface BusinessSettings {
  min_price_ratio: number;
  reservation_ttl_min: number;
  cancel_deadline_hours: number;
  grace_period_min: number;
  sales_close_offset_min: number;
  co2_per_kg: number;
  default_commission_rate: number;
}

export interface RecommendationWeights {
  proximity: number;
  preference: number;
  popularity: number;
  rating: number;
  discount: number;
  urgency: number;
  favorite: number;
}

export interface AuditEntry {
  id: number;
  actorId: number | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: number | null;
  diff: unknown;
  createdAt: string;
}
