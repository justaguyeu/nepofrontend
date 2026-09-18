"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, MoreHorizontal, Play, Send } from "lucide-react";
import { api } from "@/lib/api";
import { avatarUrl, formatCount as fmtCount, timeAgo } from "@/lib/utils";
import type { Comment, Post } from "@/lib/types";

function CommentRow({ comment, onReply }: { comment: Comment; onReply: (username: string, parentId: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${comment.author.username}`} className="h-8 w-8 rounded-full overflow-hidden relative bg-border shrink-0">
          <Image src={avatarUrl(comment.author)} alt={comment.author.username} fill className="object-cover" unoptimized />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-snug">
            <Link href={`/profile/${comment.author.username}`} className="font-bold mr-1.5">
              {comment.author.username}
            </Link>
            {comment.text}
          </p>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted font-semibold">
            <span>{timeAgo(comment.created_at)}</span>
            {comment.like_count > 0 && <span>{fmtCount(comment.like_count)} likes</span>}
            <button onClick={() => onReply(comment.author.username, comment.id)}>Reply</button>
          </div>
        </div>
        <button aria-label="Like comment" className="text-muted mt-1">
          <Heart size={13} />
        </button>
      </div>

      {comment.replies?.length > 0 && (
        <div className="pl-11 flex flex-col gap-2.5">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex items-start gap-2.5">
              <Link href={`/profile/${reply.author.username}`} className="h-6 w-6 rounded-full overflow-hidden relative bg-border shrink-0">
                <Image src={avatarUrl(reply.author)} alt={reply.author.username} fill className="object-cover" unoptimized />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] leading-snug">
                  <Link href={`/profile/${reply.author.username}`} className="font-bold mr-1.5">
                    {reply.author.username}
                  </Link>
                  {reply.text}
                </p>
                <span className="text-[11px] text-muted font-semibold">{timeAgo(reply.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<{ username: string; parentId: string } | null>(null);
  const [posting, setPosting] = useState(false);
  const [slide, setSlide] = useState(0);

  function loadComments() {
    api.comments(id).then(setComments).catch(() => {});
  }

  useEffect(() => {
    api
      .post(id)
      .then((p) => {
        setPost(p);
        setLiked(p.is_liked);
        setLikeCount(p.like_count);
      })
      .catch(() => setError("This post couldn't be found."));
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function toggleLike() {
    if (!post) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    api.likePost(post.id).catch(() => {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    });
  }

  function handleReply(username: string, parentId: string) {
    setReplyTo({ username, parentId });
    setDraft(`@${username} `);
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !post) return;
    setPosting(true);
    try {
      await api.addComment(post.id, draft.trim(), replyTo?.parentId);
      setDraft("");
      setReplyTo(null);
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
        <Link href="/" className="text-sm font-semibold text-brand-dark">Back to feed</Link>
      </main>
    );
  }

  if (!post) {
    return <main className="flex-1 max-w-md mx-auto w-full py-20 text-center text-sm text-muted">Loading post...</main>;
  }

  const media = post.media[slide];

  return (
    <main className="flex-1 max-w-md mx-auto w-full flex flex-col min-h-svh pb-4">
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 sticky top-0 bg-background z-10">
        <Link href="/" className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-base font-bold">Post</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Author header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full overflow-hidden relative shrink-0 bg-border">
              <Image src={avatarUrl(post.author)} alt={post.author.username} fill className="object-cover" unoptimized />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">{post.author.username}</p>
              <p className="text-[11px] text-muted">{timeAgo(post.created_at)}</p>
            </div>
          </Link>
          <button aria-label="More options" className="text-muted p-1">
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Media */}
        {media && (
          <div className="px-4">
            <div className="relative w-full aspect-square bg-border overflow-hidden rounded-2xl">
              <Image src={media.file_url} alt="" fill className="object-cover" unoptimized />
              {media.media_type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="h-14 w-14 rounded-full bg-black/35 backdrop-blur flex items-center justify-center">
                    <Play size={22} className="text-white fill-white ml-0.5" />
                  </span>
                </div>
              )}
              {post.media.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {post.media.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlide(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${i === slide ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-5">
          <button onClick={toggleLike} className="flex items-center gap-1.5">
            <Heart size={20} className={liked ? "fill-red-500 text-red-500" : "text-foreground"} />
            <span className="text-[13px] font-semibold">{fmtCount(likeCount)}</span>
          </button>
          <span className="flex items-center gap-1.5 text-foreground/80">
            <MessageCircle size={20} />
            <span className="text-[13px] font-semibold">{fmtCount(post.comment_count)}</span>
          </span>
          <span className="flex items-center gap-1.5 text-foreground/80 ml-auto">
            <Send size={19} />
          </span>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="px-4 pb-3 text-sm leading-snug">
            <Link href={`/profile/${post.author.username}`} className="font-bold mr-1.5">
              {post.author.username}
            </Link>
            {post.caption}
            {post.hashtags.length > 0 && (
              <span className="text-brand-dark ml-1">{post.hashtags.map((h) => `#${h.name}`).join(" ")}</span>
            )}
            {post.location_name && <p className="text-xs text-muted mt-1">{post.location_name}</p>}
          </div>
        )}

        <div className="h-px bg-border w-full my-1" />

        {/* Comments */}
        <div className="px-4 py-3 flex flex-col gap-4">
          {post.comments_disabled && (
            <p className="text-center text-xs text-muted py-6">Comments are turned off for this post.</p>
          )}
          {!post.comments_disabled && comments === null && (
            <p className="text-center text-xs text-muted py-6">Loading comments...</p>
          )}
          {!post.comments_disabled && comments?.length === 0 && (
            <p className="text-center text-xs text-muted py-6">No comments yet. Be the first to say something.</p>
          )}
          {comments?.map((c) => (
            <CommentRow key={c.id} comment={c} onReply={handleReply} />
          ))}
        </div>
      </div>

      {!post.comments_disabled && (
        <form onSubmit={handleSubmitComment} className="flex items-center gap-2 px-4 py-3 border-t border-border sticky bottom-0 bg-background">
          {replyTo && (
            <button
              type="button"
              onClick={() => { setReplyTo(null); setDraft(""); }}
              className="text-[11px] text-muted font-semibold shrink-0"
            >
              Cancel
            </button>
          )}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={replyTo ? `Replying to ${replyTo.username}...` : "Add a comment..."}
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
      )}
    </main>
  );
}
