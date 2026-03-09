import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, email, password, city } =
      validationResult.data;

    // Phone is already formatted by the Zod schema transform (+237...)

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

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone,
        email: email || null,
        passwordHash,
        city,
        role: "CLIENT",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        city: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { success: true, message: "Compte créé avec succès", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
