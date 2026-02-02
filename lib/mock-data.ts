// ===========================================
// Mock Data for Demo Mode
// ===========================================

import { DriverCard, City, BookingStatus } from "@/types";

export const MOCK_DRIVERS: Record<City, DriverCard[]> = {
  DOUALA: [
    {
      id: "drv_1",
      slug: "jean-pierre-mbarga",
      firstName: "Jean-Pierre",
      lastName: "Mbarga",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      hourlyRate: 2500,
      avgRating: 4.9,
      totalTrips: 156,
      experienceYears: 8,
      languages: ["Français", "Anglais"],
      cities: ["DOUALA", "YAOUNDE"],
      bio: "Chauffeur professionnel avec 8 ans d'expérience. Ponctuel, courtois et discret. Spécialisé dans les transferts aéroport et les voyages d'affaires.",
    },
    {
      id: "drv_2",
      slug: "paul-nkomo",
      firstName: "Paul",
      lastName: "Nkomo",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
      hourlyRate: 2000,
      avgRating: 4.7,
      totalTrips: 89,
      experienceYears: 5,
      languages: ["Français", "Pidgin"],
      cities: ["DOUALA"],
      bio: "À votre service pour tous vos déplacements en ville et hors ville. Connaissance parfaite de Douala et ses environs.",
    },
    {
      id: "drv_3",
      slug: "marie-tchinda",
      firstName: "Marie",
      lastName: "Tchinda",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
      hourlyRate: 2200,
      avgRating: 4.8,
      totalTrips: 112,
      experienceYears: 6,
      languages: ["Français", "Anglais", "Ewondo"],
      cities: ["DOUALA", "LIMBE", "BUEA"],
      bio: "Conductrice expérimentée. Spécialisée dans les transferts aéroport et les événements spéciaux.",
    },
    {
      id: "drv_4",
      slug: "emmanuel-fouda",
      firstName: "Emmanuel",
      lastName: "Fouda",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
      hourlyRate: 1800,
      avgRating: 4.6,
      totalTrips: 67,
      experienceYears: 4,
      languages: ["Français"],
      cities: ["DOUALA"],
      bio: "Jeune chauffeur dynamique et professionnel. Service courtois et ponctualité garantie.",
    },
    {
      id: "drv_5",
      slug: "sophie-atangana",
      firstName: "Sophie",
      lastName: "Atangana",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
      hourlyRate: 2300,
      avgRating: 4.9,
      totalTrips: 203,
      experienceYears: 10,
      languages: ["Français", "Anglais", "Bassa"],
      cities: ["DOUALA", "YAOUNDE"],
      bio: "10 ans d'expérience au service de clients exigeants. Discrétion et professionnalisme assurés.",
    },
  ],
  YAOUNDE: [
    {
      id: "drv_6",
      slug: "andre-essomba",
      firstName: "André",
      lastName: "Essomba",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
      hourlyRate: 2400,
      avgRating: 4.8,
      totalTrips: 134,
      experienceYears: 7,
      languages: ["Français", "Anglais", "Ewondo"],
      cities: ["YAOUNDE", "DOUALA"],
      bio: "Expert des rues de Yaoundé. Transport VIP et corporate. Véhicule climatisé et confortable.",
    },
    {
      id: "drv_7",
      slug: "celestine-onana",
      firstName: "Célestine",
      lastName: "Onana",
      avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face",
      hourlyRate: 2100,
      avgRating: 4.7,
      totalTrips: 98,
      experienceYears: 5,
      languages: ["Français", "Beti"],
      cities: ["YAOUNDE"],
      bio: "Service personnalisé pour vos déplacements quotidiens. Disponible 7j/7.",
    },
    {
      id: "drv_8",
      slug: "roger-mvondo",
      firstName: "Roger",
      lastName: "Mvondo",
      avatarUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=face",
      hourlyRate: 1900,
      avgRating: 4.5,
      totalTrips: 76,
      experienceYears: 4,
      languages: ["Français"],
      cities: ["YAOUNDE"],
      bio: "Chauffeur fiable et ponctuel. Tarifs compétitifs pour un service de qualité.",
    },
  ],
  LIMBE: [
    {
      id: "drv_9",
      slug: "peter-njoh",
      firstName: "Peter",
      lastName: "Njoh",
      avatarUrl: "https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=200&h=200&fit=crop&crop=face",
      hourlyRate: 2000,
      avgRating: 4.8,
      totalTrips: 89,
      experienceYears: 6,
      languages: ["Anglais", "Français", "Pidgin"],
      cities: ["LIMBE", "BUEA"],
      bio: "Your trusted driver in Limbe. Perfect for beach trips and tourist destinations.",
    },
    {
      id: "drv_10",
      slug: "grace-epie",
      firstName: "Grace",
      lastName: "Epie",
      avatarUrl: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop&crop=face",
      hourlyRate: 1800,
      avgRating: 4.6,
      totalTrips: 54,
      experienceYears: 3,
      languages: ["Anglais", "Pidgin"],
      cities: ["LIMBE"],
      bio: "Friendly and reliable service. Great knowledge of Limbe and surrounding areas.",
    },
  ],
  BUEA: [
    {
      id: "drv_11",
      slug: "martin-tabi",
      firstName: "Martin",
      lastName: "Tabi",
      avatarUrl: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&crop=face",
      hourlyRate: 2200,
      avgRating: 4.9,
      totalTrips: 145,
      experienceYears: 8,
      languages: ["Anglais", "Français", "Pidgin"],
      cities: ["BUEA", "LIMBE", "DOUALA"],
      bio: "Expert driver for Mount Cameroon trips and inter-city travels. Safe and comfortable rides guaranteed.",
    },
    {
      id: "drv_12",
      slug: "florence-agbor",
      firstName: "Florence",
      lastName: "Agbor",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
      hourlyRate: 1900,
      avgRating: 4.7,
      totalTrips: 78,
      experienceYears: 5,
      languages: ["Anglais", "French"],
      cities: ["BUEA", "LIMBE"],
      bio: "Professional female driver serving Buea and environs. University campus specialist.",
    },
  ],
};

export const MOCK_BOOKINGS = [
  {
    id: "bkg_1",
    driverId: "drv_1",
    clientName: "Demo User",
    startDate: new Date("2025-02-05T09:00:00"),
    endDate: new Date("2025-02-05T17:00:00"),
    hoursBooked: 8,
    pickupLocation: "Akwa, Douala",
    status: "CONFIRMED" as BookingStatus,
    totalAmount: 23000,
  },
];

export const CITY_STATS = {
  DOUALA: { driverCount: 45, avgPrice: 2100 },
  YAOUNDE: { driverCount: 38, avgPrice: 2000 },
  LIMBE: { driverCount: 12, avgPrice: 1900 },
  BUEA: { driverCount: 15, avgPrice: 2000 },
};

// Helper to get drivers by city
export function getMockDriversByCity(city: City): DriverCard[] {
  return MOCK_DRIVERS[city] || [];
}

// Helper to get all drivers
export function getAllMockDrivers(): DriverCard[] {
  return Object.values(MOCK_DRIVERS).flat();
}

// Helper to get driver by slug
export function getMockDriverBySlug(slug: string): DriverCard | undefined {
  return getAllMockDrivers().find((d) => d.slug === slug);
}

// Helper to check if demo mode
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}
