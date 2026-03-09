import { z } from "zod";

const envSchema = z.object({
  // Required
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  DIRECT_URL: z.string().url("DIRECT_URL must be a valid URL"),

  // App
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Alpha-Drivers"),

  // Platform
  PLATFORM_COMMISSION_PERCENT: z.coerce.number().default(15),
  DRIVER_REGISTRATION_FEE: z.coerce.number().default(2000),

  // Supabase (required for file storage)
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // NotchPay (required for payments in production)
  NOTCHPAY_SECRET_KEY: z.string().optional(),
  NOTCHPAY_WEBHOOK_SECRET: z.string().optional(),

  // Optional services
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

/**
 * Validate and return environment variables.
 * Throws at startup if required vars are missing.
 */
export function getEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  _env = result.data;
  return _env;
}
