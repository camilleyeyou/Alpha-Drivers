import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/db/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const userId = session!.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      select: {
        clientId: true,
        driver: { select: { userId: true } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    const isParticipant =
      booking.clientId === userId || booking.driver.userId === userId;

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    const result = await prisma.message.updateMany({
      where: {
        bookingId: params.id,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ updated: result.count });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
