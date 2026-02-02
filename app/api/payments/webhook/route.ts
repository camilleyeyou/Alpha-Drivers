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
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    const { event, data } = payload;

    console.log("Webhook received:", event, data.reference);

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
      default:
        console.log("Unhandled webhook event:", event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentComplete(data: any) {
  const { reference, amount, currency, channel, customer } = data;

  // Find the transaction
  const transaction = await prisma.transaction.findFirst({
    where: { providerRef: reference },
    include: { booking: true },
  });

  if (!transaction) {
    console.error("Transaction not found for reference:", reference);
    return;
  }

  // Update transaction status
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      status: "COMPLETED",
      provider: channel,
      processedAt: new Date(),
      metadata: data,
    },
  });

  // Handle based on transaction type
  if (transaction.type === "ESCROW_DEPOSIT" && transaction.booking) {
    // Update booking status to PAID
    await prisma.booking.update({
      where: { id: transaction.bookingId! },
      data: { status: "PAID" },
    });

    // TODO: Send notification to driver about new booking

    console.log(`Booking ${transaction.bookingId} paid successfully`);
  } else if (transaction.type === "REGISTRATION_FEE") {
    // Update driver registration status
    const driver = await prisma.driver.findFirst({
      where: { userId: transaction.payerId! },
    });

    if (driver) {
      await prisma.driver.update({
        where: { id: driver.id },
        data: {
          registrationPaid: true,
          registrationPaidAt: new Date(),
          status: "PENDING_VERIFICATION",
        },
      });

      console.log(`Driver ${driver.id} registration payment completed`);
    }
  }
}

async function handlePaymentFailed(data: any) {
  const { reference, message } = data;

  // Find and update the transaction
  const transaction = await prisma.transaction.findFirst({
    where: { providerRef: reference },
  });

  if (transaction) {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "FAILED",
        failureReason: message || "Payment failed",
        processedAt: new Date(),
        metadata: data,
      },
    });

    // If it's a booking payment, update booking status
    if (transaction.bookingId) {
      await prisma.booking.update({
        where: { id: transaction.bookingId },
        data: { status: "CANCELLED" },
      });
    }

    console.log(`Payment failed for transaction ${transaction.id}: ${message}`);
  }
}

async function handleTransferComplete(data: any) {
  const { reference, amount } = data;

  // Find the transaction
  const transaction = await prisma.transaction.findFirst({
    where: { providerRef: reference },
  });

  if (transaction) {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "COMPLETED",
        processedAt: new Date(),
        metadata: data,
      },
    });

    // If it's a driver payout, update booking status to RELEASED
    if (transaction.type === "DRIVER_PAYOUT" && transaction.bookingId) {
      await prisma.booking.update({
        where: { id: transaction.bookingId },
        data: {
          status: "RELEASED",
          releasedAt: new Date(),
        },
      });

      // Update driver earnings
      const booking = await prisma.booking.findUnique({
        where: { id: transaction.bookingId },
      });

      if (booking) {
        await prisma.driver.update({
          where: { id: booking.driverId },
          data: {
            totalEarnings: { increment: transaction.amount },
            totalTrips: { increment: 1 },
          },
        });
      }

      console.log(`Driver payout completed for booking ${transaction.bookingId}`);
    }
  }
}

async function handleTransferFailed(data: any) {
  const { reference, message } = data;

  const transaction = await prisma.transaction.findFirst({
    where: { providerRef: reference },
  });

  if (transaction) {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "FAILED",
        failureReason: message || "Transfer failed",
        processedAt: new Date(),
        metadata: data,
      },
    });

    // Mark booking as disputed if payout failed
    if (transaction.bookingId) {
      await prisma.booking.update({
        where: { id: transaction.bookingId },
        data: {
          status: "DISPUTED",
          disputeReason: "Payout transfer failed",
          disputedAt: new Date(),
        },
      });
    }

    console.log(`Transfer failed for transaction ${transaction.id}: ${message}`);
  }
}
