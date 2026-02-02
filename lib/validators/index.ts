import { z } from "zod";

// Phone regex for Cameroon numbers
const phoneRegex = /^(\+237|237)?[6][0-9]{8}$/;

export const phoneSchema = z
  .string()
  .min(9, "Numéro de téléphone invalide")
  .regex(/^[0-9+]+$/, "Numéro de téléphone invalide")
  .transform((val) => {
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.startsWith("237")) return `+${cleaned}`;
    return `+237${cleaned}`;
  });

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: phoneSchema,
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
  city: z.enum(["DOUALA", "YAOUNDE", "LIMBE", "BUEA"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const driverRegisterSchema = registerSchema.extend({
  hourlyRate: z.number().min(500, "Le tarif minimum est 500 FCFA/heure").max(50000, "Le tarif maximum est 50,000 FCFA/heure"),
  experienceYears: z.number().min(0).max(50).optional(),
  languages: z.array(z.string()).min(1, "Sélectionnez au moins une langue"),
  cities: z.array(z.enum(["DOUALA", "YAOUNDE", "LIMBE", "BUEA"])).min(1, "Sélectionnez au moins une ville"),
  bio: z.string().max(500, "La bio ne peut pas dépasser 500 caractères").optional(),
  momoNumber: phoneSchema,
  momoProvider: z.enum(["MTN", "ORANGE"]),
});

export const bookingSchema = z.object({
  driverId: z.string().cuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  hoursBooked: z.number().min(1, "Minimum 1 heure").max(24, "Maximum 24 heures"),
  pickupLocation: z.string().min(5, "Veuillez préciser le lieu de prise en charge"),
  pickupCity: z.enum(["DOUALA", "YAOUNDE", "LIMBE", "BUEA"]),
  dropoffLocation: z.string().optional(),
  specialRequests: z.string().max(500).optional(),
});

export const otpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6, "Le code doit contenir 6 chiffres"),
});

export const reviewSchema = z.object({
  bookingId: z.string().cuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type DriverRegisterInput = z.infer<typeof driverRegisterSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
