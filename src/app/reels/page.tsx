"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clapperboard } from "lucide-react";
import ReelCard from "@/components/ReelCard";
import { api } from "@/lib/api";
import type { Reel } from "@/lib/types";

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .reelsDiscover()
      .then(setReels)
      .catch(() => setError("Couldn't load Reels right now."));
  }, []);

  if (reels === null) {
    return (
      <main className="h-svh w-full flex items-center justify-center bg-black text-white text-sm">
        {error || "Loading reels..."}
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
      </main>
    );
  }

  return (
    <main className="h-svh w-full overflow-y-auto snap-y snap-mandatory bg-black">
      {reels.map((reel) => (
        <ReelCard key={reel.id} reel={reel} />
      ))}
    </main>
  );
}
