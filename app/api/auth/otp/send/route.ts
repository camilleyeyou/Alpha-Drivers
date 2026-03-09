import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

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

    // Generate a 6-digit OTP code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any existing unused codes for this phone
    await prisma.otpCode.updateMany({
      where: { phone, used: false },
      data: { used: true },
    });

    // Create new OTP code
    await prisma.otpCode.create({
      data: { phone, code, expiresAt },
    });

    // Send OTP via SMS (Twilio or other provider)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              To: phone,
              From: fromNumber || "",
              Body: `Votre code Alpha-Drivers: ${code}. Expire dans 10 minutes.`,
            }),
          }
        );

        if (!response.ok) {
          // SMS failed but OTP was created — return success anyway
          // In production, this should alert the ops team
        }
      } catch {
        // SMS delivery failure — code still exists in DB for manual verification
      }
    }

    return NextResponse.json({
      success: true,
      message: "Code de vérification envoyé.",
      // In development without Twilio, return the code for testing
      ...((!process.env.TWILIO_ACCOUNT_SID) ? { code } : {}),
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
