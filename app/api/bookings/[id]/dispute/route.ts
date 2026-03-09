import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/db/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { reason } = await request.json();

    if (!reason || reason.length < 10) {
      return NextResponse.json(
        { error: "Veuillez décrire le problème (minimum 10 caractères)." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { driver: { select: { userId: true } } },
    });

    if (!booking) {
      return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    }

    // Only client or driver can open a dispute
    const isClient = booking.clientId === session!.user.id;
    const isDriver = booking.driver.userId === session!.user.id;
    if (!isClient && !isDriver) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    // Can dispute from COMPLETED or IN_PROGRESS
    const disputableStatuses = ["IN_PROGRESS", "COMPLETED"];
    if (!disputableStatuses.includes(booking.status)) {
      return NextResponse.json(
        { error: "Un litige ne peut être ouvert que pour une course en cours ou terminée." },
        { status: 400 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: "DISPUTED",
        disputeReason: reason,
        disputedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
