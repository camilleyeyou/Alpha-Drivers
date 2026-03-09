import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, "auth");
  if (rateLimited) return rateLimited;

  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Le numéro de téléphone est requis." },
        { status: 400 }
      );
    }

    // Always return success to prevent user enumeration
    const successMsg = "Si ce compte existe, un email de réinitialisation a été envoyé.";

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !user.email) {
      return NextResponse.json({ success: true, message: successMsg });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail({
      email: user.email,
      name: user.firstName || "Utilisateur",
      resetUrl,
    });

    return NextResponse.json({ success: true, message: successMsg });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
