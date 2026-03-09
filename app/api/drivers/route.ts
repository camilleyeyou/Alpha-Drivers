import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { City } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const city = searchParams.get("city")?.toUpperCase() as City | undefined;
    const minRate = searchParams.get("minRate")
      ? parseInt(searchParams.get("minRate")!)
      : undefined;
    const maxRate = searchParams.get("maxRate")
      ? parseInt(searchParams.get("maxRate")!)
      : undefined;
    const minRating = searchParams.get("minRating")
      ? parseFloat(searchParams.get("minRating")!)
      : undefined;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const sortBy = searchParams.get("sortBy") || "avgRating";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {
      status: "VERIFIED",
      user: { isActive: true },
    };

    if (city) where.cities = { has: city };
    if (minRate || maxRate) {
      where.hourlyRate = {};
      if (minRate) where.hourlyRate.gte = minRate;
      if (maxRate) where.hourlyRate.lte = maxRate;
    }
    if (minRating) where.avgRating = { gte: minRating };
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { bio: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === "hourlyRate") orderBy.hourlyRate = sortOrder;
    else if (sortBy === "totalTrips") orderBy.totalTrips = sortOrder;
    else orderBy.avgRating = sortOrder;

    const total = await prisma.driver.count({ where });
    const drivers = await prisma.driver.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            city: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const driverCards = drivers.map((driver) => ({
      id: driver.id,
      slug: driver.slug,
      firstName: driver.user.firstName,
      lastName: driver.user.lastName,
      avatarUrl: driver.user.avatarUrl,
      hourlyRate: driver.hourlyRate,
      avgRating: Number(driver.avgRating),
      totalTrips: driver.totalTrips,
      experienceYears: driver.experienceYears,
      languages: driver.languages,
      cities: driver.cities,
      bio: driver.bio,
    }));

    return NextResponse.json({
      success: true,
      data: {
        drivers: driverCards,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Une erreur est survenue lors du chargement des chauffeurs" },
      { status: 500 }
    );
  }
}
