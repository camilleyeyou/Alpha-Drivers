import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { getServerDictionary } from "@/lib/i18n";
import { DirectChat } from "@/components/chat/direct-chat";

export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const t = await getServerDictionary();
  const userId = session.user.id;

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      client: {
        select: { id: true, firstName: true, lastName: true },
      },
      driver: {
        select: {
          id: true,
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
    },
  });

  if (!conversation) notFound();

  const isParticipant =
    conversation.clientId === userId || conversation.driver.user.id === userId;

  if (!isParticipant) notFound();

  const isClient = conversation.clientId === userId;
  const otherUser = isClient ? conversation.driver.user : conversation.client;
  const otherName = `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim() || t.conversations.unknownUser;

  return (
    <main className="container-app py-6 sm:py-10">
      <Link
        href="/dashboard/conversations"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-500 transition-colors text-sm mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.conversations.backToInbox}
      </Link>

      <DirectChat
        conversationId={conversation.id}
        currentUserId={userId}
        otherUserName={otherName}
      />
    </main>
  );
}
