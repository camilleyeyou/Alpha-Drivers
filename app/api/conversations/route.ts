import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/db/prisma";

// GET — List conversations for the current user
export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const userId = session!.user.id;
    const isDriver = session!.user.role === "DRIVER";

    const conversations = await prisma.conversation.findMany({
      where: isDriver
        ? { driver: { userId } }
        : { clientId: userId },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        driver: {
          select: {
            id: true,
            slug: true,
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            readAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Add unread count for each conversation
    const withUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            readAt: null,
          },
        });
        return { ...conv, unreadCount };
      })
    );

    return NextResponse.json({ conversations: withUnread });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST — Create or find existing conversation with a driver
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const userId = session!.user.id;
    const body = await request.json();
    const { driverId } = body;

    if (!driverId) {
      return NextResponse.json(
        { error: "ID du chauffeur requis" },
        { status: 400 }
      );
    }

    // Verify driver exists and is verified
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      select: { id: true, userId: true, status: true },
    });

    if (!driver || driver.status !== "VERIFIED") {
      return NextResponse.json(
        { error: "Chauffeur introuvable" },
        { status: 404 }
      );
    }

    // Don't allow messaging yourself
    if (driver.userId === userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous envoyer un message" },
        { status: 400 }
      );
    }

    // Upsert: find existing or create new
    const conversation = await prisma.conversation.upsert({
      where: {
        clientId_driverId: {
          clientId: userId,
          driverId: driverId,
        },
      },
      create: {
        clientId: userId,
        driverId: driverId,
      },
      update: {},
      select: { id: true },
    });

    return NextResponse.json({ conversation });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
