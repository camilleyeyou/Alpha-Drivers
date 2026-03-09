import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { otpSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, "auth");
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const result = otpSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { phone, code } = result.data;

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Code invalide ou expiré." },
        { status: 400 }
      );
    }

    // Mark as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Mark user's phone as verified
    await prisma.user.updateMany({
      where: { phone },
      data: { isVerified: true },
    });

    return NextResponse.json({
      success: true,
      message: "Numéro vérifié avec succès.",
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
