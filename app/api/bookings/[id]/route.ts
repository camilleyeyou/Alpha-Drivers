import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
        driver: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    }

    // Only allow booking participants or admins
    const userId = session!.user.id;
    const isClient = booking.clientId === userId;
    const isDriver = booking.driver.userId === userId;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session!.user.role);

    if (!isClient && !isDriver && !isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (err) {
    console.error("Booking fetch error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
