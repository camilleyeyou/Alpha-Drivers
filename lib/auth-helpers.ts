import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Get the current session in a server context (API routes, server components).
 */
export async function getCurrentSession() {
  return await auth();
}

/**
 * Require authentication in an API route.
 * Returns the session if authenticated, or a 401 response.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      ),
    };
  }
  return { session, error: null };
}

/**
 * Require a specific role in an API route.
 */
export async function requireRole(roles: string[]) {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      ),
    };
  }
  if (!roles.includes(session.user.role)) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Accès refusé. Permissions insuffisantes." },
        { status: 403 }
      ),
    };
  }
  return { session, error: null };
}
