"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";
import { avatarUrl, timeAgo } from "@/lib/utils";
import { getCachedUsername } from "@/lib/auth";

type Conversation = Awaited<ReturnType<typeof api.conversations>>[number];

export default function MessagesPage() {
  const [threads, setThreads] = useState<Conversation[] | null>(null);
  const [error, setError] = useState("");
  const myUsername = getCachedUsername();

  useEffect(() => {
    api
      .conversations()
      .then(setThreads)
      .catch(() => setError("Couldn't load your messages."));
  }, []);

  return (
    <main className="flex-1 pb-28 max-w-md mx-auto w-full">
      <div className="flex items-center gap-3 px-4 pt-5 pb-2">
        <Link href="/" className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-base font-bold">Messages</h1>
      </div>

      {error && <p className="px-4 text-sm text-red-500">{error}</p>}

      {threads === null && !error && (
        <p className="text-center text-sm text-muted py-16">Loading...</p>
      )}

      {threads !== null && threads.length === 0 && (
        <div className="flex flex-col items-center text-center gap-2 py-16 px-6">
          <MessageCircle size={22} className="text-muted" />
          <p className="text-sm text-muted">
            No conversations yet. Message someone from their profile to get started.
          </p>
        </div>
      )}

      <div className="mt-2">
        {threads?.map((t) => {
          const other = t.is_group
            ? null
            : t.participants.find((p) => p.username !== myUsername) ?? t.participants[0];
          const title = t.is_group ? t.group_name || "Group chat" : other?.username ?? "Conversation";
          const avatar = t.is_group ? t.group_avatar_url : other ? avatarUrl(other) : "";

          return (
            <Link key={t.id} href={`/messages/${t.id}`} className="flex items-center gap-3 px-4 py-3">
              <div className="h-12 w-12 rounded-full overflow-hidden relative bg-border shrink-0">
                {avatar && <Image src={avatar} alt="" fill className="object-cover" unoptimized />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs truncate text-muted">
                  {t.last_message ? t.last_message.text || "Sent a photo" : "Say hello 👋"}
                </p>
              </div>
              {t.last_message && (
                <span className="text-[11px] text-muted shrink-0">{timeAgo(t.last_message.created_at)}</span>
              )}
            </Link>
          );
        })}
      </div>

      <BottomNav />
    </main>
  );
}
