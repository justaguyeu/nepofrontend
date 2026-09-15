"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Play, ImagePlus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";
import type { Post } from "@/lib/types";

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .explore()
      .then(setPosts)
      .catch(() => setError("Couldn't load Explore right now."));
  }, []);

  return (
    <main className="flex-1 pb-28 max-w-md mx-auto w-full">
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2.5">
          <Search size={16} className="text-muted" />
          <input
            placeholder="Search businesses, people, tags"
            className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted"
          />
        </div>
      </div>

      {error && <p className="px-4 text-sm text-red-500">{error}</p>}

      {posts === null && !error && (
        <p className="text-center text-sm text-muted py-16">Loading Explore...</p>
      )}

      {posts !== null && posts.length === 0 && (
        <div className="flex flex-col items-center text-center gap-2 py-16 px-6">
          <ImagePlus size={22} className="text-muted" />
          <p className="text-sm text-muted">
            Nothing to discover yet — Explore fills up as people post on Nepo.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-0.5">
        {posts?.map((post, i) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className={`relative bg-border ${
              i % 7 === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
            }`}
          >
            {post.media[0] && (
              <Image src={post.media[0].file_url} alt="" fill className="object-cover" unoptimized />
            )}
            {post.media[0]?.media_type === "video" && (
              <Play size={13} className="absolute top-1.5 left-1.5 text-white fill-white" />
            )}
          </Link>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
