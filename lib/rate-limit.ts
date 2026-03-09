import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextResponse } from "next/server";

// Auth endpoints: 5 attempts per 15 minutes per IP
const authLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60, // 15 minutes
  keyPrefix: "auth",
});

// Registration: 3 attempts per hour per IP
const registerLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60 * 60, // 1 hour
  keyPrefix: "register",
});

// General API: 60 requests per minute per IP
const apiLimiter = new RateLimiterMemory({
  points: 60,
  duration: 60,
  keyPrefix: "api",
});

// File uploads: 10 per hour per user
const uploadLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60 * 60,
  keyPrefix: "upload",
});

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export type RateLimitType = "auth" | "register" | "api" | "upload";

const limiters: Record<RateLimitType, RateLimiterMemory> = {
  auth: authLimiter,
  register: registerLimiter,
  api: apiLimiter,
  upload: uploadLimiter,
};

/**
 * Check rate limit. Returns null if allowed, or a 429 NextResponse if blocked.
 */
export async function checkRateLimit(
  request: Request,
  type: RateLimitType,
  key?: string
): Promise<NextResponse | null> {
  const limiter = limiters[type];
  const clientKey = key || getClientIp(request);

  try {
    await limiter.consume(clientKey);
    return null;
  } catch {
    return NextResponse.json(
      { error: "Trop de tentatives. Veuillez réessayer plus tard." },
      { status: 429 }
    );
  }
}
