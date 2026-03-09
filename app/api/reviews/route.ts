import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { reviewSchema } from "@/lib/validators";
import prisma from "@/lib/db/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const result = reviewSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { bookingId, rating, comment } = result.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { driver: { select: { id: true, userId: true } } },
    });

    if (!booking) {
      return NextResponse.json({ error: "Réservation introuvable." }, { status: 404 });
    }

    // Only COMPLETED or RELEASED bookings can be reviewed
    if (!["COMPLETED", "RELEASED"].includes(booking.status)) {
      return NextResponse.json(
        { error: "Vous ne pouvez laisser un avis que pour une course terminée." },
        { status: 400 }
      );
    }

    // Determine reviewer and reviewee
    const isClient = booking.clientId === session!.user.id;
    const isDriver = booking.driver.userId === session!.user.id;

    if (!isClient && !isDriver) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    // Client reviews driver, driver reviews client
    const revieweeId = isClient ? booking.driver.userId : booking.clientId;

    // Check for duplicate review
    const existing = await prisma.review.findUnique({
      where: {
        bookingId_reviewerId: {
          bookingId,
          reviewerId: session!.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Vous avez déjà laissé un avis pour cette course." },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        reviewerId: session!.user.id,
        revieweeId,
        rating,
        comment: comment || null,
      },
    });

    // If client reviewed the driver, update driver's avgRating
    if (isClient) {
      const agg = await prisma.review.aggregate({
        where: { revieweeId: booking.driver.userId },
        _avg: { rating: true },
      });

      if (agg._avg.rating !== null) {
        await prisma.driver.update({
          where: { id: booking.driver.id },
          data: { avgRating: new Decimal(agg._avg.rating.toFixed(2)) },
        });
      }
    }

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
