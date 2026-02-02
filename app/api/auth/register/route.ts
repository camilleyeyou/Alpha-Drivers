import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators";

// Demo mode check
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, email, password, city } = validationResult.data;

    // Format phone number
    let formattedPhone = phone.replace(/\D/g, "");
    if (!formattedPhone.startsWith("237")) {
      formattedPhone = `+237${formattedPhone}`;
    } else {
      formattedPhone = `+${formattedPhone}`;
    }

    // Demo mode - simulate successful registration
    if (isDemoMode) {
      return NextResponse.json(
        { 
          success: true, 
          message: "Compte créé avec succès (Mode Démo)",
          user: {
            id: `demo_${Date.now()}`,
            firstName,
            lastName,
            phone: formattedPhone,
            email: email || null,
            city,
            role: "CLIENT",
            createdAt: new Date(),
          },
          demo: true,
        },
        { status: 201 }
      );
    }

    // Production mode - require database
    const { default: prisma } = await import("@/lib/db/prisma");
    const bcrypt = await import("bcryptjs");

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: formattedPhone },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.phone === formattedPhone) {
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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone: formattedPhone,
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
      { 
        success: true, 
        message: "Compte créé avec succès",
        user 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    
    // If in demo mode, still return success
    if (isDemoMode) {
      return NextResponse.json(
        { 
          success: true, 
          message: "Compte créé avec succès (Mode Démo)",
          demo: true,
        },
        { status: 201 }
      );
    }
    
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
