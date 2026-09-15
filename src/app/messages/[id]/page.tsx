"use client";

import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { api } from "@/lib/api";
import { avatarUrl } from "@/lib/utils";
import { getCachedUsername } from "@/lib/auth";

type Msg = Awaited<ReturnType<typeof api.conversationMessages>>[number];

export default function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Msg[] | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const myUsername = getCachedUsername();
  const bottomRef = useRef<HTMLDivElement>(null);

  function load() {
    api
      .conversationMessages(id)
      .then(setMessages)
      .catch(() => setError("Couldn't load this conversation."));
  }

  useEffect(load, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    try {
      await api.sendMessage(id, draft.trim());
      setDraft("");
      load();
    } catch {
      setError("Message didn't send. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="flex-1 max-w-md mx-auto w-full flex flex-col min-h-svh">
      <div className="flex items-center gap-3 px-4 pt-5 pb-2">
        <Link href="/messages" className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-base font-bold">Conversation</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2.5">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {messages === null && !error && (
          <p className="text-center text-sm text-muted py-10">Loading...</p>
        )}
        {messages?.map((m, i) => {
          const isMe = m.sender.username === myUsername;
          return (
            <div key={i} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && (
                <div className="h-7 w-7 rounded-full overflow-hidden relative bg-border shrink-0">
                  <Image src={avatarUrl(m.sender)} alt="" fill className="object-cover" unoptimized />
                </div>
              )}
              <div
                className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                  isMe ? "bg-brand text-pill rounded-br-sm" : "bg-surface border border-border rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-border">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message..."
          className="flex-1 bg-surface border border-border rounded-full px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
        <button
          disabled={sending || !draft.trim()}
          className="h-10 w-10 rounded-full bg-brand text-pill flex items-center justify-center disabled:opacity-50"
          aria-label="Send"
        >
          <Send size={16} />
        </button>
      </form>
    </main>
  );
}
