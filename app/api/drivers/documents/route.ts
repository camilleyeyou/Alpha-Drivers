import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { uploadDocument } from "@/lib/supabase";
import prisma from "@/lib/db/prisma";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_DOC_TYPES = [
  "CNI_FRONT",
  "CNI_BACK",
  "DRIVING_LICENSE_FRONT",
  "DRIVING_LICENSE_BACK",
  "PROFILE_PHOTO",
] as const;

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const user = session!.user;

  if (!user.driverId) {
    return NextResponse.json(
      { error: "Seuls les chauffeurs peuvent téléverser des documents." },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("type") as string | null;

    if (!file || !docType) {
      return NextResponse.json(
        { error: "Fichier et type de document requis." },
        { status: 400 }
      );
    }

    if (!VALID_DOC_TYPES.includes(docType as any)) {
      return NextResponse.json(
        { error: "Type de document invalide." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez JPG, PNG ou WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Le fichier dépasse la taille maximale de 5 Mo." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const storagePath = `${user.driverId}/${docType}.${ext}`;

    const path = await uploadDocument(buffer, storagePath, file.type);

    // Upsert document record (uses @@unique([driverId, type]))
    const document = await prisma.document.upsert({
      where: {
        driverId_type: {
          driverId: user.driverId,
          type: docType as any,
        },
      },
      update: {
        fileUrl: path,
        originalName: file.name,
        status: "PENDING",
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
      },
      create: {
        driverId: user.driverId,
        type: docType as any,
        fileUrl: path,
        originalName: file.name,
        status: "PENDING",
      },
    });

    // When profile photo is uploaded, update user's avatarUrl
    if (docType === "PROFILE_PHOTO") {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: `/api/avatar/${user.driverId}` },
      });
    }

    return NextResponse.json({ success: true, document });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur lors du téléversement." },
      { status: 500 }
    );
  }
}
