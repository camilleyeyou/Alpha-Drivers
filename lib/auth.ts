import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validators";

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
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.phone = (user as any).phone;
        token.role = (user as any).role;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.city = (user as any).city;
        token.isVerified = (user as any).isVerified;
        token.driverId = (user as any).driverId;
        token.driverStatus = (user as any).driverStatus;
      }
      return token;
    },

    async session({ session, token }) {
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
