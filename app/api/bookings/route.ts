import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { bookingSchema } from "@/lib/validators";
import { calculateTotalAmount } from "@/lib/utils";
import prisma from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const rateLimited = await checkRateLimit(request, "api", session!.user.id);
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const result = bookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      driverId,
      startDate,
      endDate,
      hoursBooked,
      pickupLocation,
      pickupCity,
      dropoffLocation,
      specialRequests,
    } = result.data;

    // Validate start date is in the future
    const start = new Date(startDate);
    if (start <= new Date()) {
      return NextResponse.json(
        { error: "La date de début doit être dans le futur." },
        { status: 400 }
      );
    }

    // Verify driver exists and is verified
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver || driver.status !== "VERIFIED") {
      return NextResponse.json(
        { error: "Ce chauffeur n'est pas disponible." },
        { status: 400 }
      );
    }

    // Prevent self-booking
    if (driver.userId === session!.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas réserver votre propre profil." },
        { status: 400 }
      );
    }

    // Calculate fees
    const end = new Date(endDate);
    const driverFee = driver.hourlyRate * hoursBooked;
    const { platformFee, totalAmount } = calculateTotalAmount(driverFee);

    // Use DB transaction to prevent race conditions on overlap check + create
    const booking = await prisma.$transaction(async (tx) => {
      // Check for overlapping bookings inside the transaction
      const overlapping = await tx.booking.findFirst({
        where: {
          driverId,
          status: { in: ["PENDING", "PAID", "CONFIRMED", "IN_PROGRESS"] },
          startDate: { lt: end },
          endDate: { gt: start },
        },
      });

      if (overlapping) {
        throw new Error("OVERLAP");
      }

      return tx.booking.create({
        data: {
          clientId: session!.user.id,
          driverId,
          startDate: start,
          endDate: end,
          hoursBooked,
          pickupLocation,
          pickupCity: pickupCity as any,
          dropoffLocation: dropoffLocation || null,
          specialRequests: specialRequests || null,
          driverFee,
          platformFee,
          totalAmount,
          status: "PENDING",
        },
      });
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (err: any) {
    if (err?.message === "OVERLAP") {
      return NextResponse.json(
        { error: "Ce chauffeur a déjà une réservation sur ce créneau." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la réservation." },
      { status: 500 }
    );
  }
}
