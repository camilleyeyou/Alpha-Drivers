import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { bookingSchema } from "@/lib/validators";
import { calculateTotalAmount } from "@/lib/utils";
import prisma from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

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

    // Calculate fees
    const driverFee = driver.hourlyRate * hoursBooked;
    const { platformFee, totalAmount } = calculateTotalAmount(driverFee);

    const booking = await prisma.booking.create({
      data: {
        clientId: session!.user.id,
        driverId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
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

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (err: any) {
    console.error("Booking creation error:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la réservation." },
      { status: 500 }
    );
  }
}
