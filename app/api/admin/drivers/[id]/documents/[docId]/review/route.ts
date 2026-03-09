import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { reviewDocumentSchema } from "@/lib/validators";
import prisma from "@/lib/db/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  const { session, error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (error) return error;

  const body = await request.json();
  const parsed = reviewDocumentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const document = await prisma.document.findFirst({
    where: {
      id: params.docId,
      driverId: params.id,
    },
  });

  if (!document) {
    return NextResponse.json(
      { error: "Document non trouvé." },
      { status: 404 }
    );
  }

  const updated = await prisma.document.update({
    where: { id: params.docId },
    data: {
      status: parsed.data.status as any,
      rejectionReason:
        parsed.data.status === "REJECTED"
          ? parsed.data.rejectionReason || null
          : null,
      reviewedBy: session!.user.id,
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, document: updated });
}
