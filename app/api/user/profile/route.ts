import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";

const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email().optional().or(z.literal("")),
  city: z.enum(["DOUALA", "YAOUNDE", "LIMBE", "BUEA"]),
  // Driver-only fields
  hourlyRate: z.number().min(500).max(50000).optional(),
  bio: z.string().max(500).optional().or(z.literal("")),
  experienceYears: z.number().min(0).max(50).optional(),
  languages: z.array(z.string()).min(1).optional(),
  cities: z.array(z.enum(["DOUALA", "YAOUNDE", "LIMBE", "BUEA"])).min(1).optional(),
  momoNumber: z.string().optional(),
  momoProvider: z.enum(["MTN", "ORANGE"]).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, city, hourlyRate, bio, experienceYears, languages, cities, momoNumber, momoProvider } = parsed.data;

    // Check email uniqueness if changed
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, id: { not: session.user.id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
      }
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName,
        email: email || null,
        city,
      },
    });

    // Update driver profile if user is a driver
    if (session.user.driverId && (hourlyRate || bio !== undefined || languages || cities)) {
      await prisma.driver.update({
        where: { id: session.user.driverId },
        data: {
          ...(hourlyRate !== undefined && { hourlyRate }),
          ...(bio !== undefined && { bio: bio || null }),
          ...(experienceYears !== undefined && { experienceYears }),
          ...(languages && { languages }),
          ...(cities && { cities }),
          ...(momoNumber && { momoNumber }),
          ...(momoProvider && { momoProvider }),
        },
      });
    }

    return NextResponse.json({ success: true, message: "Profil mis à jour" });
  } catch (error) {
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        city: true,
        role: true,
        driver: {
          select: {
            id: true,
            hourlyRate: true,
            bio: true,
            experienceYears: true,
            languages: true,
            cities: true,
            momoNumber: true,
            momoProvider: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
