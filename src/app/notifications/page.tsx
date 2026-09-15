"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";
import { avatarUrl, timeAgo } from "@/lib/utils";

const icons: Record<string, typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  follow_request: UserPlus,
  mention: MessageCircle,
  tag: MessageCircle,
};

const labels: Record<string, string> = {
  like: "liked your post",
  comment: "commented on your post",
  follow: "started following you",
  follow_request: "requested to follow you",
  mention: "mentioned you",
  tag: "tagged you in a post",
};

type Notif = Awaited<ReturnType<typeof api.notifications>>[number];

export default function NotificationsPage() {
  const [items, setItems] = useState<Notif[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .notifications()
      .then(setItems)
      .catch(() => setError("Couldn't load notifications."));
  }, []);

  return (
    <main className="flex-1 pb-28 max-w-md mx-auto w-full">
      <div className="flex items-center gap-3 px-4 pt-5 pb-2">
        <Link href="/" className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-base font-bold">Notifications</h1>
      </div>

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
              href={`/profile/${n.actor.username}`}
              className="flex items-center gap-3 px-4 py-3"
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
                <span className="text-foreground/80">{labels[n.notification_type] ?? "interacted with you"}</span>{" "}
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
