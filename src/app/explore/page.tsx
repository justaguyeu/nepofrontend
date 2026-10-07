"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ImagePlus, X, Hash } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import LoadMoreButton from "@/components/LoadMoreButton";
import MediaView from "@/components/MediaView";
import { api } from "@/lib/api";
import { usePagedList } from "@/lib/usePagedList";
import { avatarUrl } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";

function SearchResults({ query }: { query: string }) {
  // null = still searching
  const [results, setResults] = useState<{ query: string; users: UserProfile[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Debounce so typing doesn't fire a request per keystroke.
    const timer = setTimeout(() => {
      api
        .searchUsers(query)
        .then((users) => !cancelled && setResults({ query, users }))
        .catch(() => !cancelled && setResults({ query, users: [] }));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const tag = query.replace(/^#/, "").toLowerCase();
  const users = results?.query === query ? results.users : null;

  return (
    <div className="px-4 flex flex-col gap-1">
      {/^#?\w+$/.test(query) && (
        <Link href={`/trending?tag=${encodeURIComponent(tag)}`} className="flex items-center gap-3 py-2.5">
          <span className="h-10 w-10 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
            <Hash size={16} className="text-muted" />
          </span>
          <span className="text-sm font-semibold">#{tag}</span>
        </Link>
      )}
      {users === null && <p className="text-center text-sm text-muted py-8">Searching...</p>}
      {users?.length === 0 && <p className="text-center text-sm text-muted py-8">No people or businesses match “{query}”.</p>}
      {users?.map((u) => (
        <Link key={u.id} href={`/profile/${u.username}`} className="flex items-center gap-3 py-2.5">
          <span className="h-10 w-10 rounded-full overflow-hidden relative bg-border shrink-0">
            <Image src={avatarUrl(u)} alt="" fill className="object-cover" unoptimized />
          </span>
          <span className="min-w-0">
            <span className="text-sm font-semibold flex items-center gap-1">
              {u.username}
              {u.is_business && (
                <span className="text-[9px] font-bold bg-brand text-pill rounded px-1 py-0.5 leading-none">BIZ</span>
              )}
            </span>
            {u.full_name && <span className="text-xs text-muted block truncate">{u.full_name}</span>}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function ExplorePage() {
  const explore = usePagedList(api.explore);
  const posts = explore.items;
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

  return (
    <main className="flex-1 pb-28 max-w-md mx-auto w-full">
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2.5">
          <Search size={16} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search businesses, people, tags"
            aria-label="Search"
            className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="text-muted">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {trimmed ? (
        <SearchResults key={trimmed} query={trimmed} />
      ) : (
        <>
          {explore.error && <p className="px-4 text-sm text-red-500">Couldn&apos;t load Explore right now.</p>}

          {posts === null && !explore.error && (
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
                className={`relative bg-border overflow-hidden ${
                  i % 7 === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
                }`}
              >
                {post.media[0] && <MediaView url={post.media[0].file_url} type={post.media[0].media_type} thumbnail />}
              </Link>
            ))}
          </div>
          {explore.hasMore && <LoadMoreButton onClick={explore.loadMore} loading={explore.loadingMore} />}
        </>
      )}

      <BottomNav />
    </main>
  );
}
