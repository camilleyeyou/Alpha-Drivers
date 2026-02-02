import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";

// Demo mode check
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Demo user for testing
const DEMO_USER = {
  id: "demo_user_1",
  firstName: "Demo",
  lastName: "User",
  phone: "+237699999999",
  email: "demo@alpha-drivers.cm",
  role: "CLIENT",
  city: "DOUALA",
  isVerified: true,
  driver: null,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { phone, password } = validationResult.data;

    // Demo mode - accept any credentials
    if (isDemoMode) {
      return NextResponse.json({
        success: true,
        message: "Connexion réussie (Mode Démo)",
        user: {
          ...DEMO_USER,
          phone,
        },
        demo: true,
      });
    }

    // Production mode - require database
    // Dynamic import to avoid errors when DATABASE_URL is not set
    const { default: prisma } = await import("@/lib/db/prisma");
    const bcrypt = await import("bcryptjs");

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { driver: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Numéro de téléphone ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Votre compte a été désactivé. Contactez le support." },
        { status: 403 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Numéro de téléphone ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Connexion réussie",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        city: user.city,
        isVerified: user.isVerified,
        driver: user.driver ? {
          id: user.driver.id,
          status: user.driver.status,
          hourlyRate: user.driver.hourlyRate,
        } : null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    
    // If database connection fails, suggest demo mode
    if (isDemoMode) {
      return NextResponse.json({
        success: true,
        message: "Connexion réussie (Mode Démo)",
        user: DEMO_USER,
        demo: true,
      });
    }
    
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la connexion" },
      { status: 500 }
    );
  }
}
