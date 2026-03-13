import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import prisma from "@/lib/db/prisma";
import { z } from "zod";

const changeRoleSchema = z.object({
  role: z.enum(["CLIENT", "DRIVER", "ADMIN", "SUPER_ADMIN"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Only SUPER_ADMIN can change roles
  const { session, error } = await requireRole(["SUPER_ADMIN"]);
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = changeRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Rôle invalide" },
        { status: 400 }
      );
    }

    const { role: newRole } = parsed.data;
    const targetUserId = params.id;
    const currentUserId = session!.user.id;

    // Prevent changing your own role
    if (targetUserId === currentUserId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas modifier votre propre rôle" },
        { status: 400 }
      );
    }

    // Check target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, driver: { select: { id: true } } },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Prevent setting DRIVER role if user has no driver profile
    if (newRole === "DRIVER" && !targetUser.driver) {
      return NextResponse.json(
        { error: "Cet utilisateur n'a pas de profil chauffeur" },
        { status: 400 }
      );
    }

    // Update the role
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
