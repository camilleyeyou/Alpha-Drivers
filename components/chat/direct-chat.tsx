"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, MessageSquare, CheckCheck, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  readAt: string | null;
  createdAt: string;
  sender: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface DirectChatProps {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
}

const POLL_INTERVAL_MS = 5000;

export function DirectChat({
  conversationId,
  currentUserId,
  otherUserName,
}: DirectChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [loadError, setLoadError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!res.ok) {
        setLoadError(t.chat.errorLoad);
        return;
      }
      const data = await res.json();
      setMessages(data.messages);
      setLoadError("");
    } catch {
      setLoadError(t.chat.errorLoad);
    }
  }, [conversationId, t.chat.errorLoad]);

  useEffect(() => {
    fetchMessages();
    const timer = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: optimisticId,
      content: trimmed,
      senderId: currentUserId,
      readAt: null,
      createdAt: new Date().toISOString(),
      sender: { id: currentUserId, firstName: null, lastName: null },
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSending(true);
    setSendError("");

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setSendError(t.chat.errorSend);
      } else {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? data.message : m))
        );
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setSendError(t.chat.errorSend);
    } finally {
      setSending(false);
    }
  };

  const isSent = (msg: ChatMessage) => msg.senderId === currentUserId;

  return (
    <Card className="border-0 shadow-card-lift">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary-500" />
          {otherUserName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col">
        {loadError && (
          <div className="mx-6 mb-3 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
            {loadError}
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex flex-col gap-3 overflow-y-auto px-4 sm:px-6 py-3"
          style={{ minHeight: "300px", maxHeight: "500px" }}
        >
          {messages.length === 0 && !loadError ? (
            <div className="flex flex-1 items-center justify-center py-12 text-sm text-gray-400">
              {t.conversations.startChatting}
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col gap-0.5",
                  isSent(msg) ? "items-end" : "items-start"
                )}
              >
                {!isSent(msg) && msg.sender.firstName && (
                  <span className="text-xs font-medium text-gray-500 ml-1">
                    {msg.sender.firstName}
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isSent(msg)
                      ? "bg-primary-500 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  )}
                >
                  {msg.content}
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs text-gray-400 px-1",
                    isSent(msg) ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <span>{formatTime(msg.createdAt)}</span>
                  {isSent(msg) &&
                    (msg.readAt ? (
                      <CheckCheck className="h-3.5 w-3.5 text-primary-400" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    ))}
                </div>
              </div>
            ))
          )}
        </div>

        {sendError && (
          <div className="mx-4 sm:mx-6 mb-2 rounded-xl bg-red-50 border border-red-100 p-2 text-xs text-red-600">
            {sendError}
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 border-t border-gray-100 px-3 sm:px-4 py-3"
        >
          <textarea
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
            rows={1}
            maxLength={1000}
            placeholder={t.chat.placeholder}
            value={input}
            disabled={sending}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <Button
            type="submit"
            size="sm"
            disabled={sending || !input.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
