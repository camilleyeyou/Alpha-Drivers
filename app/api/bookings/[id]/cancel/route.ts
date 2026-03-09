import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/db/prisma";
import { generateReference, createTransfer } from "@/lib/payments/notchpay";

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
        client: { select: { phone: true } },
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

    // If booking was paid, initiate actual refund via NotchPay
    if ((booking.status === "PAID" || booking.status === "CONFIRMED") && booking.transactions[0]) {
      const refundRef = generateReference("booking");

      // Create refund transaction record
      const refundTx = await prisma.transaction.create({
        data: {
          bookingId: booking.id,
          type: "REFUND",
          amount: booking.totalAmount,
          currency: "XAF",
          status: "PENDING",
          providerRef: refundRef,
          payeeId: booking.clientId,
          momoNumber: booking.client.phone,
          description: `Remboursement réservation #${booking.id.slice(-6)}`,
        },
      });

      try {
        // Execute the refund transfer to client's phone
        const transfer = await createTransfer({
          amount: booking.totalAmount,
          recipient: booking.client.phone,
          reference: refundRef,
          description: `Alpha-Drivers remboursement #${booking.id.slice(-6)}`,
        });

        await prisma.transaction.update({
          where: { id: refundTx.id },
          data: { status: "PROCESSING", metadata: transfer as any },
        });
      } catch (refundErr) {
        // Mark refund as failed but still cancel the booking
        await prisma.transaction.update({
          where: { id: refundTx.id },
          data: {
            status: "FAILED",
            failureReason: refundErr instanceof Error ? refundErr.message : "Refund failed",
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
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
