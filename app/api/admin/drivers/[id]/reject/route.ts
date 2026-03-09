import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { rejectDriverSchema } from "@/lib/validators";
import prisma from "@/lib/db/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (error) return error;

  const body = await request.json();
  const parsed = rejectDriverSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const driver = await prisma.driver.findUnique({
    where: { id: params.id },
  });

  if (!driver) {
    return NextResponse.json(
      { error: "Chauffeur non trouvé." },
      { status: 404 }
    );
  }

  const updated = await prisma.driver.update({
    where: { id: params.id },
    data: {
      status: "REJECTED",
      rejectionReason: parsed.data.rejectionReason,
      verifiedBy: session!.user.id,
    },
  });

  return NextResponse.json({ success: true, driver: updated });
}
