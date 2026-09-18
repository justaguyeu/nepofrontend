"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Music2, Send } from "lucide-react";
import { api } from "@/lib/api";
import { avatarUrl, formatCount as fmtCount, timeAgo } from "@/lib/utils";
import type { Reel } from "@/lib/types";

type ReelComment = Awaited<ReturnType<typeof api.reelComments>>[number];

export default function ReelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [reel, setReel] = useState<Reel | null>(null);
  const [comments, setComments] = useState<ReelComment[] | null>(null);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  function loadComments() {
    api.reelComments(id).then(setComments).catch(() => {});
  }

  useEffect(() => {
    api
      .reel(id)
      .then((r) => {
        setReel(r);
        setLiked(r.is_liked);
        setLikeCount(r.like_count);
      })
      .catch(() => setError("This reel couldn't be found."));
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function toggleLike() {
    if (!reel) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    api.likeReel(reel.id).catch(() => {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    });
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !reel) return;
    setPosting(true);
    try {
      await api.addReelComment(reel.id, draft.trim());
      setDraft("");
      loadComments();
    } catch {
      setError("Comment didn't post. Try again.");
    } finally {
      setPosting(false);
    }
  }

  if (error) {
    return (
      <main className="flex-1 max-w-md mx-auto w-full flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
        <p className="text-sm text-muted">{error}</p>
        <Link href="/reels" className="text-sm font-semibold text-brand-dark">Back to reels</Link>
      </main>
    );
  }

  if (!reel) {
    return <main className="flex-1 max-w-md mx-auto w-full py-20 text-center text-sm text-muted">Loading reel...</main>;
  }

  return (
    <main className="flex-1 max-w-md mx-auto w-full flex flex-col min-h-svh pb-4">
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 sticky top-0 bg-background z-10">
        <Link href="/reels" className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-base font-bold">Reel</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4">
          <div className="relative w-full aspect-[9/16] max-h-[55vh] bg-black overflow-hidden rounded-2xl">
            {reel.video_url ? (
              <video src={reel.video_url} controls loop playsInline className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <Image src={reel.thumbnail_url} alt="" fill className="object-cover" unoptimized />
            )}
          </div>
        </div>

        <div className="px-4 pt-3 pb-2 flex items-center gap-5">
          <button onClick={toggleLike} className="flex items-center gap-1.5">
            <Heart size={20} className={liked ? "fill-red-500 text-red-500" : "text-foreground"} />
            <span className="text-[13px] font-semibold">{fmtCount(likeCount)}</span>
          </button>
          <span className="text-[13px] font-semibold text-muted">{fmtCount(reel.view_count)} views</span>
        </div>

        <div className="px-4 pb-3">
          <Link href={`/profile/${reel.author.username}`} className="flex items-center gap-2.5 mb-2">
            <div className="h-8 w-8 rounded-full overflow-hidden relative bg-border shrink-0">
              <Image src={avatarUrl(reel.author)} alt={reel.author.username} fill className="object-cover" unoptimized />
            </div>
            <p className="text-sm font-bold">{reel.author.username}</p>
            <span className="text-[11px] text-muted">{timeAgo(reel.created_at)}</span>
          </Link>
          {reel.caption && <p className="text-sm leading-snug">{reel.caption}</p>}
          {reel.audio_title && (
            <p className="flex items-center gap-1.5 text-xs text-muted mt-1.5">
              <Music2 size={12} /> {reel.audio_title}
            </p>
          )}
        </div>

        <div className="h-px bg-border w-full my-1" />

        <div className="px-4 py-3 flex flex-col gap-4">
          {comments === null && <p className="text-center text-xs text-muted py-6">Loading comments...</p>}
          {comments?.length === 0 && (
            <p className="text-center text-xs text-muted py-6">No comments yet. Be the first to say something.</p>
          )}
          {comments?.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <Link href={`/profile/${c.author.username}`} className="h-8 w-8 rounded-full overflow-hidden relative bg-border shrink-0">
                <Image src={avatarUrl(c.author)} alt={c.author.username} fill className="object-cover" unoptimized />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">
                  <Link href={`/profile/${c.author.username}`} className="font-bold mr-1.5">
                    {c.author.username}
                  </Link>
                  {c.text}
                </p>
                <span className="text-[11px] text-muted font-semibold">{timeAgo(c.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmitComment} className="flex items-center gap-2 px-4 py-3 border-t border-border sticky bottom-0 bg-background">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-surface border border-border rounded-full px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
        <button
          disabled={posting || !draft.trim()}
          className="h-10 w-10 rounded-full bg-brand text-pill flex items-center justify-center disabled:opacity-50 shrink-0"
          aria-label="Post comment"
        >
          <Send size={16} />
        </button>
      </form>
    </main>
  );
}
