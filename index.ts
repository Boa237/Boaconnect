export type Role = 'user' | 'artisan' | 'admin';

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string | null;
  role: Role;
  preferredLanguage: 'fr' | 'en';
  city: string | null;
  neighborhood: string | null;
  isProfileComplete: boolean;
}

export interface Category {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  icon: string;
}

export interface ListingPhoto {
  id: string;
  url: string;
  position: number;
}

export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'archived';

export interface Listing {
  id: string;
  ownerId: string;
  category: Category;
  title: string;
  description: string;
  price: number | null;
  priceUnit: 'total' | 'per_month' | 'per_night' | 'on_request';
  currency: string;
  city: string;
  neighborhood: string;
  latitude: number | null;
  longitude: number | null;
  status: ListingStatus;
  whatsappNumber: string | null;
  contactPhone: string | null;
  photos: ListingPhoto[];
  createdAt: string;
}

export interface PaginatedListings {
  items: Listing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
