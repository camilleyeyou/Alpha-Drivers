// ===========================================
// Alpha-Drivers Type Definitions
// ===========================================

export type UserRole = "CLIENT" | "DRIVER" | "ADMIN" | "SUPER_ADMIN";
export type City = "DOUALA" | "YAOUNDE" | "LIMBE" | "BUEA";
export type DriverStatus = "PENDING_PAYMENT" | "PENDING_VERIFICATION" | "VERIFIED" | "SUSPENDED" | "REJECTED";
export type DocumentType = "CNI_FRONT" | "CNI_BACK" | "DRIVING_LICENSE_FRONT" | "DRIVING_LICENSE_BACK" | "PROFILE_PHOTO";
export type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED";
export type BookingStatus = "PENDING" | "PAID" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "RELEASED" | "DISPUTED" | "CANCELLED" | "REFUNDED";
export type TransactionType = "ESCROW_DEPOSIT" | "DRIVER_PAYOUT" | "PLATFORM_FEE" | "REFUND" | "REGISTRATION_FEE";
export type TransactionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface User {
  id: string;
  email: string | null;
  phone: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  city: City | null;
  isVerified: boolean;
  createdAt: Date;
}

export interface Driver {
  id: string;
  userId: string;
  hourlyRate: number;
  bio: string | null;
  experienceYears: number | null;
  languages: string[];
  cities: City[];
  status: DriverStatus;
  avgRating: number;
  totalTrips: number;
  slug: string | null;
  user?: User;
}

export interface DriverCard {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  hourlyRate: number;
  avgRating: number;
  totalTrips: number;
  experienceYears: number | null;
  languages: string[];
  cities: City[];
  bio: string | null;
}

export interface Booking {
  id: string;
  clientId: string;
  driverId: string;
  startDate: Date;
  endDate: Date;
  hoursBooked: number;
  pickupLocation: string;
  pickupCity: City;
  status: BookingStatus;
  driverFee: number;
  platformFee: number;
  totalAmount: number;
  createdAt: Date;
}

export interface BookingWithDetails extends Booking {
  client: User;
  driver: Driver & { user: User };
}

export interface CreateBookingInput {
  driverId: string;
  startDate: string;
  endDate: string;
  hoursBooked: number;
  pickupLocation: string;
  pickupCity: City;
  dropoffLocation?: string;
  specialRequests?: string;
}

export interface CityPageData {
  city: City;
  slug: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  latitude: number;
  longitude: number;
  driverCount: number;
  avgPrice: number | null;
  drivers: DriverCard[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// City display data
export const CITIES: Record<City, { name: string; nameFr: string; region: string }> = {
  DOUALA: { name: "Douala", nameFr: "Douala", region: "Littoral" },
  YAOUNDE: { name: "Yaoundé", nameFr: "Yaoundé", region: "Centre" },
  LIMBE: { name: "Limbe", nameFr: "Limbé", region: "South-West" },
  BUEA: { name: "Buea", nameFr: "Buéa", region: "South-West" },
};

export const CITY_SLUGS: Record<string, City> = {
  douala: "DOUALA",
  yaounde: "YAOUNDE",
  limbe: "LIMBE",
  buea: "BUEA",
};
