"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Clapperboard } from "lucide-react";
import ReelCard from "@/components/ReelCard";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";
import { usePagedList } from "@/lib/usePagedList";

export default function ReelsPage() {
  const discover = usePagedList(api.reelsDiscover);
  const reels = discover.items;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { hasMore, loadMore } = discover;

  // Fetch the next batch as the person scrolls onto the last reel.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const obs = new IntersectionObserver(([entry]) => entry.isIntersecting && loadMore());
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadMore, reels?.length]);

  if (reels === null) {
    return (
      <main className="h-svh w-full flex items-center justify-center bg-black text-white text-sm">
        {discover.error ? "Couldn't load Reels right now." : "Loading reels..."}
        <BottomNav />
      </main>
    );
  }

  if (reels.length === 0) {
    return (
      <main className="h-svh w-full flex flex-col items-center justify-center gap-3 bg-black text-white text-center px-8">
        <Clapperboard size={26} className="text-white/60" />
        <p className="text-sm text-white/80">
          No reels yet — be the first to share a short video on Nepo.
        </p>
        <Link href="/create" className="text-sm font-semibold text-brand mt-1">
          Create a reel
        </Link>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="h-svh w-full overflow-y-auto snap-y snap-mandatory bg-black">
      {reels.map((reel, i) => (
        <div key={reel.id} className="relative">
          <ReelCard reel={reel} />
          {i === reels.length - 1 && <div ref={sentinelRef} className="absolute top-1/2 h-px w-full" />}
        </div>
      ))}
    </main>
  );
}
