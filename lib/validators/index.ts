import { z } from "zod";

// Phone schema for Cameroon numbers
export const phoneSchema = z
  .string()
  .min(9, "Numéro de téléphone invalide")
  .regex(/^[0-9+]+$/, "Numéro de téléphone invalide")
  .transform((val) => {
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.startsWith("237")) return `+${cleaned}`;
    return `+237${cleaned}`;
  });

// Base schema without refine (so it can be extended)
const baseRegisterSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: phoneSchema,
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
  city: z.enum(["DOUALA", "YAOUNDE", "LIMBE", "BUEA"]),
});

// Login schema
export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

// Register schema with password confirmation
export const registerSchema = baseRegisterSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  }
);

// Driver register schema - extends base, then adds refine
export const driverRegisterSchema = baseRegisterSchema
  .extend({
    hourlyRate: z.number().min(500, "Le tarif minimum est 500 FCFA/heure").max(50000, "Le tarif maximum est 50,000 FCFA/heure"),
    experienceYears: z.number().min(0).max(50).optional(),
    languages: z.array(z.string()).min(1, "Sélectionnez au moins une langue"),
    cities: z.array(z.enum(["DOUALA", "YAOUNDE", "LIMBE", "BUEA"])).min(1, "Sélectionnez au moins une ville"),
    bio: z.string().max(500, "La bio ne peut pas dépasser 500 caractères").optional(),
    momoNumber: phoneSchema,
    momoProvider: z.enum(["MTN", "ORANGE"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Booking schema
export const bookingSchema = z.object({
  driverId: z.string().min(1, "Driver ID requis"),
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().min(1, "Date de fin requise"),
  hoursBooked: z.number().min(1, "Minimum 1 heure").max(24, "Maximum 24 heures"),
  pickupLocation: z.string().min(5, "Veuillez préciser le lieu de prise en charge"),
  pickupCity: z.enum(["DOUALA", "YAOUNDE", "LIMBE", "BUEA"]),
  dropoffLocation: z.string().optional(),
  specialRequests: z.string().max(500).optional(),
});

// OTP schema
export const otpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6, "Le code doit contenir 6 chiffres"),
});

// Review schema
export const reviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID requis"),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type DriverRegisterInput = z.infer<typeof driverRegisterSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;