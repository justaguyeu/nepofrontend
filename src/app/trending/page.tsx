"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Flame, Hash } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";
import { formatCount } from "@/lib/utils";
import type { Post } from "@/lib/types";

type Hashtag = { id: number; name: string; post_count: number };

export default function TrendingPage() {
  const [hashtags, setHashtags] = useState<Hashtag[] | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .trendingHashtags()
      .then(setHashtags)
      .catch(() => setError("Couldn't load trending tags."));
  }, []);

  function openTag(name: string) {
    setActive(name);
    setPosts(null);
    api.hashtagPosts(name).then(setPosts).catch(() => setPosts([]));
  }

  return (
    <main className="flex-1 pb-28 max-w-md mx-auto w-full">
      <div className="flex items-center gap-3 px-4 pt-5 pb-3">
        {active ? (
          <button
            onClick={() => setActive(null)}
            className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center"
            aria-label="Back to trending"
          >
            <ArrowLeft size={16} />
          </button>
        ) : (
          <Link href="/" className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center">
            <ArrowLeft size={16} />
          </Link>
        )}
        <h1 className="text-base font-bold flex items-center gap-1.5">
          {active ? `#${active}` : (<><Flame size={16} className="text-brand" /> Trending</>)}
        </h1>
      </div>

      {error && <p className="px-4 text-sm text-red-500">{error}</p>}

      {!active && (
        <>
          {hashtags === null && !error && (
            <p className="text-center text-sm text-muted py-16">Loading trending tags...</p>
          )}
          {hashtags !== null && hashtags.length === 0 && (
            <div className="flex flex-col items-center text-center gap-2 py-16 px-6">
              <Hash size={22} className="text-muted" />
              <p className="text-sm text-muted">
                No trending tags yet — hashtags fill up as people post on Nepo.
              </p>
            </div>
          )}
          <div className="px-4 flex flex-col gap-2">
            {hashtags?.map((tag, i) => (
              <button
                key={tag.id}
                onClick={() => openTag(tag.name)}
                className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-3 text-left"
              >
                <span className="h-9 w-9 rounded-full bg-brand/10 text-brand-dark flex items-center justify-center font-black text-sm shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">#{tag.name}</p>
                  <p className="text-xs text-muted">{formatCount(tag.post_count)} posts</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {active && (
        <>
          {posts === null && (
            <p className="text-center text-sm text-muted py-16">Loading posts...</p>
          )}
          {posts !== null && posts.length === 0 && (
            <p className="text-center text-sm text-muted py-16">No posts under #{active} yet.</p>
          )}
          <div className="grid grid-cols-3 gap-0.5">
            {posts?.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="relative aspect-square bg-border"
              >
                {post.media[0] && (
                  <Image src={post.media[0].file_url} alt="" fill className="object-cover" unoptimized />
                )}
              </Link>
            ))}
          </div>
        </>
      )}

      <BottomNav />
    </main>
  );
}
