"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";
import { avatarUrl, timeAgo } from "@/lib/utils";
import type { Notification, UserSummary } from "@/lib/types";

const icons: Record<string, typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  follow_request: UserPlus,
  mention: MessageCircle,
  tag: MessageCircle,
};

function label(n: Notification): string {
  const target = n.reel ? "reel" : "post";
  switch (n.notification_type) {
    case "like": return `liked your ${target}`;
    case "comment": return `commented on your ${target}`;
    case "follow": return "started following you";
    case "follow_request": return "requested to follow you";
    case "mention": return "mentioned you";
    case "tag": return "tagged you in a post";
    default: return "interacted with you";
  }
}

/** Likes/comments open the post or reel; follows open the person's profile. */
function href(n: Notification): string {
  if (n.post) return `/post/${n.post}`;
  if (n.reel) return `/reel/${n.reel}`;
  return `/profile/${n.actor.username}`;
}

type FollowRequest = { id: string; follower: UserSummary; created_at: string };

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[] | null>(null);
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .notifications()
      .then((list) => {
        setItems(list);
        // They've now been seen; clears the unread badge in the top bar.
        if (list.some((n) => !n.is_read)) api.markNotificationsRead().catch(() => {});
      })
      .catch(() => setError("Couldn't load notifications."));
    api.followRequests().then(setRequests).catch(() => {});
  }, []);

  async function respond(request: FollowRequest, accept: boolean) {
    setRequests((list) => list.filter((r) => r.id !== request.id));
    try {
      if (accept) {
        await api.acceptFollowRequest(request.id);
        setItems((list) =>
          list && list.map((n) =>
            n.notification_type === "follow_request" && n.actor.id === request.follower.id
              ? { ...n, notification_type: "follow" }
              : n
          )
        );
      } else {
        await api.declineFollowRequest(request.id);
        setItems((list) =>
          list && list.filter((n) => !(n.notification_type === "follow_request" && n.actor.id === request.follower.id))
        );
      }
    } catch {
      setRequests((list) => [request, ...list]);
    }
  }

  return (
    <main className="flex-1 pb-28 max-w-md mx-auto w-full">
      <div className="flex items-center gap-3 px-4 pt-5 pb-2">
        <Link href="/" aria-label="Back" className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-base font-bold">Notifications</h1>
      </div>

      {requests.length > 0 && (
        <section className="mx-4 mt-2 mb-1 bg-surface border border-border rounded-2xl px-3 py-2">
          <h2 className="text-xs font-bold text-muted px-1 py-1">Follow requests</h2>
          {requests.map((r) => (
            <div key={r.id} className="flex items-center gap-3 py-2">
              <Link href={`/profile/${r.follower.username}`} className="h-9 w-9 rounded-full overflow-hidden relative bg-border shrink-0">
                <Image src={avatarUrl(r.follower)} alt="" fill className="object-cover" unoptimized />
              </Link>
              <Link href={`/profile/${r.follower.username}`} className="flex-1 min-w-0 text-sm font-semibold truncate">
                {r.follower.username}
              </Link>
              <button onClick={() => respond(r, true)} className="bg-brand text-pill text-xs font-bold rounded-full px-3 h-8">
                Confirm
              </button>
              <button onClick={() => respond(r, false)} className="border border-border text-xs font-semibold rounded-full px-3 h-8">
                Delete
              </button>
            </div>
          ))}
        </section>
      )}

      {error && <p className="px-4 text-sm text-red-500">{error}</p>}

      {items === null && !error && (
        <p className="text-center text-sm text-muted py-16">Loading...</p>
      )}

      {items !== null && items.length === 0 && (
        <div className="flex flex-col items-center text-center gap-2 py-16 px-6">
          <Bell size={22} className="text-muted" />
          <p className="text-sm text-muted">
            No notifications yet. Likes, comments, and new followers will show up here.
          </p>
        </div>
      )}

      <div className="mt-2">
        {items?.map((n) => {
          const Icon = icons[n.notification_type] ?? Bell;
          return (
            <Link
              key={n.id}
              href={href(n)}
              className={`flex items-center gap-3 px-4 py-3 ${n.is_read ? "" : "bg-brand/5"}`}
            >
              <div className="relative h-10 w-10 shrink-0">
                <div className="h-10 w-10 rounded-full overflow-hidden relative bg-border">
                  <Image src={avatarUrl(n.actor)} alt="" fill className="object-cover" unoptimized />
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center border-2 border-background ${
                    n.notification_type === "like"
                      ? "bg-red-500"
                      : n.notification_type.startsWith("follow")
                      ? "bg-brand"
                      : "bg-blue-500"
                  }`}
                >
                  <Icon size={10} className="text-white fill-white" />
                </span>
              </div>
              <p className="text-sm flex-1 leading-snug">
                <span className="font-semibold">{n.actor.username}</span>{" "}
                <span className="text-foreground/80">{label(n)}</span>{" "}
                <span className="text-muted text-xs">· {timeAgo(n.created_at)}</span>
              </p>
            </Link>
          );
        })}
      </div>

      <BottomNav />
    </main>
  );
}
