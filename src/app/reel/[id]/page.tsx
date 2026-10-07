"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Music2, Send, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useLikeToggle } from "@/lib/useLikeToggle";
import { useCachedUsername } from "@/lib/useCurrentUser";
import { avatarUrl, formatCount as fmtCount, timeAgo } from "@/lib/utils";
import type { Reel, ReelComment } from "@/lib/types";

function ReelDetail({ reel }: { reel: Reel }) {
  const myUsername = useCachedUsername();
  const like = useLikeToggle(reel.is_liked, reel.like_count, () => api.likeReel(reel.id));
  const [comments, setComments] = useState<ReelComment[] | null>(null);
  const [commentError, setCommentError] = useState("");
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    api
      .reelComments(reel.id)
      .then(setComments)
      .catch(() => {
        setComments([]);
        setCommentError("Couldn't load comments.");
      });
  }, [reel.id]);

  const canDelete = (c: ReelComment) =>
    myUsername === reel.author.username || myUsername === c.author.username;

  async function handleDelete(target: ReelComment) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api.deleteReelComment(target.id);
      setComments((list) => (list ?? []).filter((c) => c.id !== target.id));
    } catch {
      setCommentError("Couldn't delete that comment.");
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setPosting(true);
    setCommentError("");
    try {
      const created = await api.addReelComment(reel.id, draft.trim());
      setComments((list) => [...(list ?? []), created]);
      setDraft("");
    } catch {
      setCommentError("Comment didn't post. Try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <main className="flex-1 max-w-md mx-auto w-full flex flex-col min-h-svh pb-4">
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 sticky top-0 bg-background z-10">
        <Link href="/reels" aria-label="Back to reels" className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-base font-bold">Reel</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4">
          <div className="relative w-full aspect-9/16 max-h-[55vh] bg-black overflow-hidden rounded-2xl">
            {reel.video_url ? (
              <video src={reel.video_url} controls loop playsInline className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              reel.thumbnail_url && <Image src={reel.thumbnail_url} alt="" fill className="object-cover" unoptimized />
            )}
          </div>
        </div>

        <div className="px-4 pt-3 pb-2 flex items-center gap-5">
          <button onClick={like.toggle} aria-label={like.liked ? "Unlike" : "Like"} aria-pressed={like.liked} className="flex items-center gap-1.5">
            <Heart size={20} className={like.liked ? "fill-red-500 text-red-500" : "text-foreground"} />
            <span className="text-[13px] font-semibold">{fmtCount(like.count)}</span>
          </button>
          <span className="text-[13px] font-semibold text-muted">{fmtCount(reel.view_count)} views</span>
          {comments && (
            <span className="text-[13px] font-semibold text-muted">
              {fmtCount(comments.length)} {comments.length === 1 ? "comment" : "comments"}
            </span>
          )}
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
          {comments?.length === 0 && !commentError && (
            <p className="text-center text-xs text-muted py-6">No comments yet. Be the first to say something.</p>
          )}
          {comments?.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <Link href={`/profile/${c.author.username}`} className="h-8 w-8 rounded-full overflow-hidden relative bg-border shrink-0">
                <Image src={avatarUrl(c.author)} alt={c.author.username} fill className="object-cover" unoptimized />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug wrap-break-word">
                  <Link href={`/profile/${c.author.username}`} className="font-bold mr-1.5">
                    {c.author.username}
                  </Link>
                  {c.text}
                </p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted font-semibold">
                  <span>{timeAgo(c.created_at)}</span>
                  {canDelete(c) && (
                    <button onClick={() => handleDelete(c)} aria-label="Delete comment" className="flex items-center">
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-background border-t border-border">
        {commentError && <p className="px-4 pt-2 text-xs text-red-500">{commentError}</p>}
        <form onSubmit={handleSubmitComment} className="flex items-center gap-2 px-4 py-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={500}
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
      </div>
    </main>
  );
}

export default function ReelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [reel, setReel] = useState<Reel | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .reel(id)
      .then(setReel)
      .catch(() => setError("This reel couldn't be found."));
  }, [id]);

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

  return <ReelDetail key={reel.id} reel={reel} />;
}
