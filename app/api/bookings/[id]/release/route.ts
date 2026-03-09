import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/db/prisma";
import { createTransfer, generateReference } from "@/lib/payments/notchpay";

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
        driver: {
          select: { id: true, userId: true, momoNumber: true, momoProvider: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    }

    // Only client or admin can release funds
    const isClient = booking.clientId === session!.user.id;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session!.user.role);
    if (!isClient && !isAdmin) {
      return NextResponse.json({ error: "Vous n'êtes pas autorisé à libérer les fonds." }, { status: 403 });
    }

    if (booking.status !== "COMPLETED") {
      return NextResponse.json({ error: "Les fonds ne peuvent être libérés que pour une course terminée." }, { status: 400 });
    }

    if (!booking.driver.momoNumber) {
      return NextResponse.json({ error: "Le chauffeur n'a pas de numéro Mobile Money configuré." }, { status: 400 });
    }

    const payoutRef = generateReference("payout");

    // Create driver payout transaction
    const payoutTransaction = await prisma.transaction.create({
      data: {
        bookingId: booking.id,
        type: "DRIVER_PAYOUT",
        amount: booking.driverFee,
        currency: "XAF",
        status: "PENDING",
        providerRef: payoutRef,
        momoNumber: booking.driver.momoNumber,
        payeeId: booking.driver.userId,
        description: `Paiement course #${booking.id.slice(-6)}`,
      },
    });

    // Create platform fee transaction (internal record)
    await prisma.transaction.create({
      data: {
        bookingId: booking.id,
        type: "PLATFORM_FEE",
        amount: booking.platformFee,
        currency: "XAF",
        status: "COMPLETED",
        processedAt: new Date(),
        description: `Commission plateforme course #${booking.id.slice(-6)}`,
      },
    });

    // Initiate transfer to driver via NotchPay
    const transfer = await createTransfer({
      amount: booking.driverFee,
      recipient: booking.driver.momoNumber,
      reference: payoutRef,
      description: `Alpha-Drivers paiement course`,
    });

    // Update transaction status
    await prisma.transaction.update({
      where: { id: payoutTransaction.id },
      data: { status: "PROCESSING", metadata: transfer as any },
    });

    return NextResponse.json({
      success: true,
      message: "Transfert initié vers le chauffeur.",
      reference: payoutRef,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur lors du transfert." },
      { status: 500 }
    );
  }
}
