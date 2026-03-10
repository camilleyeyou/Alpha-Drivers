import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSignedUrl } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { driverId: string } }
) {
  try {
    // Verify Supabase env vars are present
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Supabase environment variables not configured" },
        { status: 500 }
      );
    }

    const doc = await prisma.document.findUnique({
      where: {
        driverId_type: {
          driverId: params.driverId,
          type: "PROFILE_PHOTO",
        },
      },
    });

    if (!doc) {
      return NextResponse.json(
        { error: "No profile photo found for this driver" },
        { status: 404 }
      );
    }

    const signedUrl = await getSignedUrl(doc.fileUrl);

    // Proxy the image bytes instead of redirecting
    const imageResponse = await fetch(signedUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image from storage" },
        { status: 502 }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=1800, s-maxage=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Avatar error: ${message}` },
      { status: 500 }
    );
  }
}
