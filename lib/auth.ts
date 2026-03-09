import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validators";

interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  phone: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  city: string | null;
  isVerified: boolean;
  driverId: string | null;
  driverStatus: string | null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        phone: { label: "Téléphone", type: "tel" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { phone, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { phone },
          include: { driver: { select: { id: true, status: true } } },
        });

        if (!user || !user.isActive) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name:
            `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null,
          phone: user.phone,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          city: user.city,
          isVerified: user.isVerified,
          driverId: user.driver?.id ?? null,
          driverStatus: user.driver?.status ?? null,
        } as AuthUser;
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as AuthUser;
        token.id = u.id;
        token.phone = u.phone;
        token.role = u.role;
        token.firstName = u.firstName;
        token.lastName = u.lastName;
        token.city = u.city;
        token.isVerified = u.isVerified;
        token.driverId = u.driverId;
        token.driverStatus = u.driverStatus;
        token.lastValidated = Date.now();
      }

      // Re-validate critical fields from DB every 5 minutes
      const lastValidated = (token.lastValidated as number) || 0;
      if (Date.now() - lastValidated > 5 * 60 * 1000) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: { driver: { select: { id: true, status: true } } },
          });

          if (!freshUser || !freshUser.isActive) {
            // User deactivated — clear id to invalidate
            token.id = "";
            return token;
          }

          token.role = freshUser.role;
          token.isVerified = freshUser.isVerified;
          token.driverId = freshUser.driver?.id ?? null;
          token.driverStatus = freshUser.driver?.status ?? null;
          token.lastValidated = Date.now();
        } catch {
          // DB error — keep existing token data
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!token.id) {
        // Token was invalidated (user deactivated)
        session.user = undefined as any;
        return session;
      }

      if (session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string | null;
        session.user.lastName = token.lastName as string | null;
        session.user.city = token.city as string | null;
        session.user.isVerified = token.isVerified as boolean;
        session.user.driverId = token.driverId as string | null;
        session.user.driverStatus = token.driverStatus as string | null;
      }
      return session;
    },

    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const publicPrefixes = [
        "/login",
        "/register",
        "/api/auth",
        "/api/avatar",
        "/api/drivers",
        "/api/payments/webhook",
        "/about",
        "/contact",
        "/terms",
        "/privacy",
        "/faq",
        "/chauffeur-",
        "/chauffeur/",
        "/drivers/",
        "/tarifs",
      ];

      if (pathname === "/") return true;
      if (publicPrefixes.some((p) => pathname.startsWith(p))) return true;

      return isLoggedIn;
    },
  },
});
