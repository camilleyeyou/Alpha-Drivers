import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone: string;
      role: string;
      firstName: string | null;
      lastName: string | null;
      city: string | null;
      isVerified: boolean;
      driverId: string | null;
      driverStatus: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    phone: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    city: string | null;
    isVerified: boolean;
    driverId: string | null;
    driverStatus: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    phone: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    city: string | null;
    isVerified: boolean;
    driverId: string | null;
    driverStatus: string | null;
  }
}
