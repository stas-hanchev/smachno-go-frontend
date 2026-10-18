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

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

export type ListingSort = 'distance' | 'rating' | 'discount' | 'price' | 'pickup';

export interface ListingSearch {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  q?: string;
  categoryIds?: number[];
  sort?: ListingSort;
  page?: number;
  limit?: number;
}
