import { NextRequest, NextResponse } from "next/server";
import { City } from "@/types";
import { getMockDriversByCity, getAllMockDrivers } from "@/lib/mock-data";

// Demo mode check
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const city = searchParams.get("city")?.toUpperCase() as City | undefined;
    const minRate = searchParams.get("minRate") ? parseInt(searchParams.get("minRate")!) : undefined;
    const maxRate = searchParams.get("maxRate") ? parseInt(searchParams.get("maxRate")!) : undefined;
    const minRating = searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "avgRating";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Demo mode - use mock data
    if (isDemoMode) {
      let drivers = city ? getMockDriversByCity(city) : getAllMockDrivers();
      
      // Apply filters
      if (minRate) drivers = drivers.filter(d => d.hourlyRate >= minRate);
      if (maxRate) drivers = drivers.filter(d => d.hourlyRate <= maxRate);
      if (minRating) drivers = drivers.filter(d => d.avgRating >= minRating);
      if (search) {
        const searchLower = search.toLowerCase();
        drivers = drivers.filter(d => 
          d.firstName.toLowerCase().includes(searchLower) ||
          d.lastName.toLowerCase().includes(searchLower) ||
          d.bio?.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort
      drivers.sort((a, b) => {
        let aVal: number, bVal: number;
        if (sortBy === "hourlyRate") {
          aVal = a.hourlyRate;
          bVal = b.hourlyRate;
        } else if (sortBy === "totalTrips") {
          aVal = a.totalTrips;
          bVal = b.totalTrips;
        } else {
          aVal = a.avgRating;
          bVal = b.avgRating;
        }
        return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
      });
      
      // Paginate
      const total = drivers.length;
      const paginatedDrivers = drivers.slice((page - 1) * limit, page * limit);
      
      return NextResponse.json({
        success: true,
        data: {
          drivers: paginatedDrivers,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        demo: true,
      });
    }

    // Production mode - use database
    const { default: prisma } = await import("@/lib/db/prisma");

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
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, city: true },
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
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    
    // Fallback to mock data on error
    const allDrivers = getAllMockDrivers();
    return NextResponse.json({
      success: true,
      data: {
        drivers: allDrivers.slice(0, 10),
        pagination: { page: 1, limit: 10, total: allDrivers.length, totalPages: 1 },
      },
      demo: true,
    });
  }
}
