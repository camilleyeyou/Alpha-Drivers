import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "driver-documents";

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

    // Download the file directly using the admin client (bypasses signed URL JWT issues)
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .download(doc.fileUrl);

    if (error || !data) {
      return new NextResponse(null, { status: 404 });
    }

    const buffer = await data.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": data.type || "image/jpeg",
        "Cache-Control": "public, max-age=3600, s-maxage=7200",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
