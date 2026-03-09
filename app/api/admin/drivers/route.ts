import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import prisma from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const { error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const where: any = {};

  if (status && status !== "all") {
    where.status = status;
  }

  if (search) {
    where.user = {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ],
    };
  }

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            city: true,
            avatarUrl: true,
          },
        },
        documents: {
          select: { type: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.driver.count({ where }),
  ]);

  return NextResponse.json({
    drivers,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
