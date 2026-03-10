"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, ChevronRight, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/context";
import { getInitials, formatTime } from "@/lib/utils";

interface ConversationItem {
  id: string;
  client: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
  driver: {
    id: string;
    slug: string | null;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    };
  };
  messages: {
    id: string;
    content: string;
    senderId: string;
    readAt: string | null;
    createdAt: string;
  }[];
  unreadCount: number;
}

export default function ConversationsPage() {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations);
          // Determine current user from conversation data
          if (data.conversations.length > 0) {
            const conv = data.conversations[0];
            // If I'm the client, my id === conv.client.id
            // Check by fetching session or infer from unread
          }
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }

    // Get current user id from session
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data?.user?.id || null);
        }
      } catch {
        // ignore
      }
    }

    fetchSession();
    fetchConversations();
  }, []);

  function getOtherUser(conv: ConversationItem) {
    if (currentUserId === conv.client.id) {
      return conv.driver.user;
    }
    return conv.client;
  }

  return (
    <main className="container-app py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-500 transition-colors text-sm mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.common.back}
      </Link>

      <h1 className="font-display text-3xl font-extrabold text-gray-900 mb-8">
        <MessageSquare className="inline h-8 w-8 text-primary-500 mr-3" />
        {t.conversations.title}
      </h1>

      <Card className="border-0 shadow-card-lift">
        <CardHeader>
          <CardTitle className="font-display">
            {t.conversations.myConversations}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              {t.common.loading}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="mx-auto h-14 w-14 text-gray-300" />
              <p className="mt-4 font-display font-bold text-gray-600">
                {t.conversations.noConversations}
              </p>
              <p className="mt-2 text-sm">{t.conversations.noConversationsHint}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => {
                const other = getOtherUser(conv);
                const lastMsg = conv.messages[0];
                return (
                  <Link
                    key={conv.id}
                    href={`/dashboard/conversations/${conv.id}`}
                    className="flex items-center justify-between rounded-2xl border p-4 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={other.avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary-50 text-primary-700 font-bold">
                          {getInitials(other.firstName, other.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-display font-bold text-gray-900">
                            {other.firstName} {other.lastName}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-primary-500 text-white text-xs px-2 py-0.5">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {lastMsg && (
                          <p className="text-sm text-gray-500 truncate mt-0.5">
                            {lastMsg.senderId === currentUserId && (
                              <span className="text-gray-400">{t.conversations.you}: </span>
                            )}
                            {lastMsg.content}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {lastMsg && (
                        <span className="text-xs text-gray-400">
                          {formatTime(lastMsg.createdAt)}
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-300" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
