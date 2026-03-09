import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/db/prisma";
import { initializePayment, generateReference } from "@/lib/payments/notchpay";

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
        client: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        driver: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    }

    if (booking.clientId !== session!.user.id) {
      return NextResponse.json({ error: "Seul le client peut payer cette réservation." }, { status: 403 });
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json({ error: "Cette réservation ne peut plus être payée." }, { status: 400 });
    }

    const reference = generateReference("booking");
    const driverName = `${booking.driver.user.firstName} ${booking.driver.user.lastName}`;

    // Create pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        bookingId: booking.id,
        type: "ESCROW_DEPOSIT",
        amount: booking.totalAmount,
        currency: "XAF",
        status: "PENDING",
        providerRef: reference,
        momoNumber: booking.client.phone,
        payerId: booking.clientId,
        description: `Réservation chauffeur ${driverName} - ${booking.hoursBooked}h`,
      },
    });

    // Initialize NotchPay payment
    const payment = await initializePayment({
      amount: booking.totalAmount,
      phone: booking.client.phone,
      reference,
      description: `Alpha-Drivers: Réservation ${driverName} (${booking.hoursBooked}h)`,
      customerName: `${booking.client.firstName} ${booking.client.lastName}`,
      customerEmail: booking.client.email || undefined,
      metadata: {
        bookingId: booking.id,
        transactionId: transaction.id,
        type: "escrow_deposit",
      },
    });

    // Update transaction with provider data
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "PROCESSING", metadata: payment as any },
    });

    return NextResponse.json({
      success: true,
      message: "Paiement initié. Validez sur votre téléphone.",
      reference,
      transaction: payment.transaction,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur lors de l'initiation du paiement." },
      { status: 500 }
    );
  }
}
