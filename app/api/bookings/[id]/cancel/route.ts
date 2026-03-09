import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/db/prisma";
import { generateReference } from "@/lib/payments/notchpay";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        driver: { select: { userId: true } },
        transactions: { where: { type: "ESCROW_DEPOSIT", status: "COMPLETED" } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    }

    // Only client, driver, or admin can cancel
    const isClient = booking.clientId === session!.user.id;
    const isDriver = booking.driver.userId === session!.user.id;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session!.user.role);
    if (!isClient && !isDriver && !isAdmin) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const cancellableStatuses = ["PENDING", "PAID", "CONFIRMED"];
    if (!cancellableStatuses.includes(booking.status)) {
      return NextResponse.json({ error: "Cette réservation ne peut plus être annulée." }, { status: 400 });
    }

    // If booking was paid, create a refund record
    if (booking.status === "PAID" || booking.status === "CONFIRMED") {
      const escrowDeposit = booking.transactions[0];
      if (escrowDeposit) {
        await prisma.transaction.create({
          data: {
            bookingId: booking.id,
            type: "REFUND",
            amount: booking.totalAmount,
            currency: "XAF",
            status: "PENDING",
            providerRef: generateReference("booking"),
            payeeId: booking.clientId,
            description: `Remboursement réservation #${booking.id.slice(-6)}`,
          },
        });
      }
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (err) {
    console.error("Booking cancel error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
