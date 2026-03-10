import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendMessageSchema } from "@/lib/validators";
import prisma from "@/lib/db/prisma";

const MESSAGE_SELECT = {
  id: true,
  content: true,
  senderId: true,
  readAt: true,
  createdAt: true,
  sender: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
};

async function getConversationAndVerifyParticipant(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      clientId: true,
      driver: { select: { userId: true } },
    },
  });

  if (!conversation) return null;

  const isParticipant =
    conversation.clientId === userId || conversation.driver.userId === userId;

  if (!isParticipant) return null;

  return conversation;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const userId = session!.user.id;
    const conversation = await getConversationAndVerifyParticipant(params.id, userId);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation introuvable" },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: "asc" },
      select: MESSAGE_SELECT,
    });

    // Mark incoming unread messages as read (fire-and-forget)
    const unreadIds = messages
      .filter((m) => m.senderId !== userId && m.readAt === null)
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      prisma.message
        .updateMany({
          where: { id: { in: unreadIds } },
          data: { readAt: new Date() },
        })
        .catch(() => {});
    }

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = session!.user.id;
  const rateLimited = await checkRateLimit(request, "api", userId);
  if (rateLimited) return rateLimited;

  try {
    const conversation = await getConversationAndVerifyParticipant(params.id, userId);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation introuvable" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Contenu invalide" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        senderId: userId,
        content: parsed.data.content,
      },
      select: MESSAGE_SELECT,
    });

    // Update conversation's updatedAt
    prisma.conversation
      .update({
        where: { id: params.id },
        data: { updatedAt: new Date() },
      })
      .catch(() => {});

    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
