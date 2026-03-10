import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/db/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const userId = session!.user.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      select: {
        clientId: true,
        driver: { select: { userId: true } },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation introuvable" },
        { status: 404 }
      );
    }

    const isParticipant =
      conversation.clientId === userId || conversation.driver.userId === userId;

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    const result = await prisma.message.updateMany({
      where: {
        conversationId: params.id,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ updated: result.count });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
