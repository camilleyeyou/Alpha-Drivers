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
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { driver: { select: { userId: true } } },
    });

    if (!booking) {
      return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    }

    if (booking.driver.userId !== session!.user.id) {
      return NextResponse.json({ error: "Seul le chauffeur peut terminer cette course." }, { status: 403 });
    }

    if (booking.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Cette course ne peut pas être terminée." }, { status: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (err) {
    console.error("Booking complete error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
