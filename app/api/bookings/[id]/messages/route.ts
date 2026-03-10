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

async function getBookingAndVerifyParticipant(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      clientId: true,
      status: true,
      driver: { select: { userId: true } },
    },
  });

  if (!booking) return null;

  const isParticipant =
    booking.clientId === userId || booking.driver.userId === userId;

  if (!isParticipant) return null;

  return booking;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const userId = session!.user.id;
    const booking = await getBookingAndVerifyParticipant(params.id, userId);

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { bookingId: params.id },
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
    const booking = await getBookingAndVerifyParticipant(params.id, userId);

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    if (["CANCELLED", "REFUNDED"].includes(booking.status)) {
      return NextResponse.json(
        { error: "La messagerie est désactivée pour cette réservation." },
        { status: 400 }
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
        bookingId: params.id,
        senderId: userId,
        content: parsed.data.content,
      },
      select: MESSAGE_SELECT,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
