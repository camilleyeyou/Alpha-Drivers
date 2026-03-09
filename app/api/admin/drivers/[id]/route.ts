import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { getSignedUrl } from "@/lib/supabase";
import prisma from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (error) return error;

  const driver = await prisma.driver.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          city: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
      documents: true,
    },
  });

  if (!driver) {
    return NextResponse.json(
      { error: "Chauffeur non trouvé." },
      { status: 404 }
    );
  }

  // Generate signed URLs for documents
  const documentsWithUrls = await Promise.all(
    driver.documents.map(async (doc) => {
      let signedUrl: string | null = null;
      try {
        signedUrl = await getSignedUrl(doc.fileUrl);
      } catch {
        // File may not exist
      }
      return { ...doc, signedUrl };
    })
  );

  return NextResponse.json({
    ...driver,
    documents: documentsWithUrls,
  });
}
