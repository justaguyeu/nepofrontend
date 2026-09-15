"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ImagePlus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import StoriesRow from "@/components/StoriesRow";
import PostCard from "@/components/PostCard";
import { api } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";
import type { Post, Story } from "@/lib/types";

export default function HomePage() {
  const { user } = useCurrentUser();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .feed()
      .then(setPosts)
      .catch(() => setError("Couldn't reach the Nepo backend. Is it running?"));
    api.storyFeed().then(setStories).catch(() => {});
  }, []);

  return (
    <main className="flex-1 pb-28 max-w-md mx-auto w-full">
      <TopBar />
      {user && <StoriesRow me={user} stories={stories} />}

      <div className="pt-1">
        {error && (
          <p className="mx-4 mb-4 text-sm text-red-500 bg-surface border border-border rounded-2xl px-4 py-3">
            {error}
          </p>
        )}

        {posts === null && !error && (
          <p className="text-center text-sm text-muted py-16">Loading your feed...</p>
        )}

        {posts !== null && posts.length === 0 && (
          <div className="flex flex-col items-center text-center gap-3 px-6 py-16">
            <span className="h-14 w-14 rounded-full bg-surface border border-border flex items-center justify-center">
              <ImagePlus size={22} className="text-muted" />
            </span>
            <p className="text-sm font-semibold">Your feed is empty</p>
            <p className="text-sm text-muted">
              Follow people and businesses on Nepo, or share your first post to get things started.
            </p>
            <Link
              href="/create"
              className="mt-1 bg-brand text-pill text-sm font-semibold px-5 py-2.5 rounded-full"
            >
              Create your first post
            </Link>
            <Link href="/explore" className="text-sm text-brand-dark font-semibold">
              Explore Nepo
            </Link>
          </div>
        )}

        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <BottomNav />
    </main>
  );
}
