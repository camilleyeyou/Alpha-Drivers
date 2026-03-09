import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSignedUrl } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { driverId: string } }
) {
  try {
    const doc = await prisma.document.findUnique({
      where: {
        driverId_type: {
          driverId: params.driverId,
          type: "PROFILE_PHOTO",
        },
      },
    });

    if (!doc) {
      return new NextResponse(null, { status: 404 });
    }

    const signedUrl = await getSignedUrl(doc.fileUrl);

    return NextResponse.redirect(signedUrl, {
      headers: {
        "Cache-Control": "public, max-age=1800, s-maxage=3600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
