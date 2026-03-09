import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import prisma from "@/lib/db/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (error) return error;

  const driver = await prisma.driver.findUnique({
    where: { id: params.id },
  });

  if (!driver) {
    return NextResponse.json(
      { error: "Chauffeur non trouvé." },
      { status: 404 }
    );
  }

  if (driver.status === "SUSPENDED") {
    return NextResponse.json(
      { error: "Ce chauffeur est déjà suspendu." },
      { status: 400 }
    );
  }

  const updated = await prisma.driver.update({
    where: { id: params.id },
    data: {
      status: "SUSPENDED",
      verifiedBy: session!.user.id,
    },
  });

  return NextResponse.json({ success: true, driver: updated });
}
