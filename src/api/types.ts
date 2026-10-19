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
