import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { driverRegisterSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = driverRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      phone,
      email,
      password,
      city,
      hourlyRate,
      experienceYears,
      languages,
      cities,
      bio,
      momoNumber,
      momoProvider,
    } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, ...(email ? [{ email }] : [])],
      },
    });

    if (existingUser) {
      if (existingUser.phone === phone) {
        return NextResponse.json(
          { error: "Ce numéro de téléphone est déjà utilisé" },
          { status: 400 }
        );
      }
      if (email && existingUser.email === email) {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé" },
          { status: 400 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and driver profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          phone,
          email: email || null,
          passwordHash,
          city,
          role: "DRIVER",
        },
      });

      const slug = `${firstName}-${lastName}-${user.id.slice(-6)}`
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const driver = await tx.driver.create({
        data: {
          userId: user.id,
          hourlyRate,
          experienceYears: experienceYears ?? null,
          languages,
          cities,
          bio: bio || null,
          momoNumber,
          momoProvider,
          slug,
          status: "PENDING_PAYMENT",
        },
      });

      return { user, driver };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Compte chauffeur créé avec succès",
        user: {
          id: result.user.id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          phone: result.user.phone,
          email: result.user.email,
          city: result.user.city,
          role: result.user.role,
        },
        driverId: result.driver.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Driver registration error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
