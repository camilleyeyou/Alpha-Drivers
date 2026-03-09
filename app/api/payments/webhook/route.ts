import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyWebhookSignature } from "@/lib/payments/notchpay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-notchpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    const { event, data } = payload;

    // Handle different event types
    switch (event) {
      case "payment.complete":
        await handlePaymentComplete(data);
        break;
      case "payment.failed":
        await handlePaymentFailed(data);
        break;
      case "transfer.complete":
        await handleTransferComplete(data);
        break;
      case "transfer.failed":
        await handleTransferFailed(data);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentComplete(data: Record<string, unknown>) {
  const reference = data.reference as string;

  // Idempotency: find transaction that is still PENDING
  const transaction = await prisma.transaction.findFirst({
    where: { providerRef: reference, status: "PENDING" },
    include: { booking: true },
  });

  if (!transaction) {
    // Already processed or not found — skip silently
    return;
  }

  // Use a DB transaction for atomicity
  await prisma.$transaction(async (tx) => {
    // Update transaction status
    await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "COMPLETED",
        provider: data.channel as string | undefined,
        processedAt: new Date(),
        metadata: data as any,
      },
    });

    // Handle based on transaction type
    if (transaction.type === "ESCROW_DEPOSIT" && transaction.booking) {
      await tx.booking.update({
        where: { id: transaction.bookingId! },
        data: { status: "PAID" },
      });
    } else if (transaction.type === "REGISTRATION_FEE") {
      const driver = await tx.driver.findFirst({
        where: { userId: transaction.payerId! },
      });

      if (driver) {
        await tx.driver.update({
          where: { id: driver.id },
          data: {
            registrationPaid: true,
            registrationPaidAt: new Date(),
            status: "PENDING_VERIFICATION",
          },
        });
      }
    }
  });
}

async function handlePaymentFailed(data: Record<string, unknown>) {
  const reference = data.reference as string;
  const message = (data.message as string) || "Payment failed";

  // Idempotency: only update if still PENDING
  const transaction = await prisma.transaction.findFirst({
    where: { providerRef: reference, status: "PENDING" },
  });

  if (!transaction) return;

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "FAILED",
        failureReason: message,
        processedAt: new Date(),
        metadata: data as any,
      },
    });

    if (transaction.bookingId) {
      await tx.booking.update({
        where: { id: transaction.bookingId },
        data: { status: "CANCELLED" },
      });
    }
  });
}

async function handleTransferComplete(data: Record<string, unknown>) {
  const reference = data.reference as string;

  // Idempotency: only update if still PENDING or PROCESSING
  const transaction = await prisma.transaction.findFirst({
    where: { providerRef: reference, status: { in: ["PENDING", "PROCESSING"] } },
  });

  if (!transaction) return;

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "COMPLETED",
        processedAt: new Date(),
        metadata: data as any,
      },
    });

    // If it's a driver payout, update booking status to RELEASED and driver earnings
    if (transaction.type === "DRIVER_PAYOUT" && transaction.bookingId) {
      await tx.booking.update({
        where: { id: transaction.bookingId },
        data: {
          status: "RELEASED",
          releasedAt: new Date(),
        },
      });

      const booking = await tx.booking.findUnique({
        where: { id: transaction.bookingId },
      });

      if (booking) {
        await tx.driver.update({
          where: { id: booking.driverId },
          data: {
            totalEarnings: { increment: transaction.amount },
            totalTrips: { increment: 1 },
          },
        });
      }
    }
  });
}

async function handleTransferFailed(data: Record<string, unknown>) {
  const reference = data.reference as string;
  const message = (data.message as string) || "Transfer failed";

  const transaction = await prisma.transaction.findFirst({
    where: { providerRef: reference, status: { in: ["PENDING", "PROCESSING"] } },
  });

  if (!transaction) return;

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "FAILED",
        failureReason: message,
        processedAt: new Date(),
        metadata: data as any,
      },
    });

    if (transaction.bookingId) {
      await tx.booking.update({
        where: { id: transaction.bookingId },
        data: {
          status: "DISPUTED",
          disputeReason: "Payout transfer failed",
          disputedAt: new Date(),
        },
      });
    }
  });
}
