"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { api } from "@/lib/api";
import NepoWordmark from "./NepoWordmark";

export default function TopBar() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api
      .notifications()
      .then((items) => setUnread(items.filter((n) => !n.is_read).length))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 pt-5 pb-3 bg-background">
      {/* Brand */}
      <Link href="/" aria-label="Nepo home" className="flex items-center text-foreground">
        <NepoWordmark height={32} />
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Create post */}
        <Link
          href="/create"
          className="h-9 w-9 rounded-full bg-surface border border-border card-shadow flex items-center justify-center text-foreground hover:bg-brand hover:border-brand hover:text-pill transition-colors"
          aria-label="Create"
        >
          <Plus size={17} />
        </Link>
        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative h-9 w-9 rounded-full bg-surface border border-border card-shadow flex items-center justify-center text-foreground"
          aria-label="Notifications"
        >
          <Bell size={16} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand text-[9px] font-bold flex items-center justify-center text-pill">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
