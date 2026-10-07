"use client";

import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useLikeToggle } from "@/lib/useLikeToggle";
import { useCachedUsername } from "@/lib/useCurrentUser";
import { avatarUrl, formatCount as fmtCount, shareLink, timeAgo } from "@/lib/utils";
import MediaView from "@/components/MediaView";
import type { Comment, Post } from "@/lib/types";

function CommentRow({
  comment,
  isReply = false,
  canDelete,
  onReply,
  onDelete,
}: {
  comment: Comment;
  isReply?: boolean;
  canDelete: (comment: Comment) => boolean;
  onReply: (username: string, threadId: string) => void;
  onDelete: (comment: Comment) => void;
}) {
  const like = useLikeToggle(comment.is_liked, comment.like_count, () => api.likeComment(comment.id));
  const avatarSize = isReply ? "h-6 w-6" : "h-8 w-8";
  // Replies stay one level deep: replying to a reply continues its parent's thread.
  const threadId = comment.parent ?? comment.id;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${comment.author.username}`} className={`${avatarSize} rounded-full overflow-hidden relative bg-border shrink-0`}>
          <Image src={avatarUrl(comment.author)} alt={comment.author.username} fill className="object-cover" unoptimized />
        </Link>
        <div className="flex-1 min-w-0">
          <p className={`${isReply ? "text-[13px]" : "text-sm"} leading-snug wrap-break-word`}>
            <Link href={`/profile/${comment.author.username}`} className="font-bold mr-1.5">
              {comment.author.username}
            </Link>
            {comment.text}
          </p>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted font-semibold">
            <span>{timeAgo(comment.created_at)}</span>
            {like.count > 0 && <span>{fmtCount(like.count)} {like.count === 1 ? "like" : "likes"}</span>}
            <button onClick={() => onReply(comment.author.username, threadId)}>Reply</button>
            {canDelete(comment) && (
              <button onClick={() => onDelete(comment)} aria-label="Delete comment" className="flex items-center">
                <Trash2 size={11} />
              </button>
            )}
          </div>
        </div>
        <button
          onClick={like.toggle}
          aria-label={like.liked ? "Unlike comment" : "Like comment"}
          aria-pressed={like.liked}
          className="mt-1"
        >
          <Heart size={13} className={like.liked ? "fill-red-500 text-red-500" : "text-muted"} />
        </button>
      </div>

      {comment.replies?.length > 0 && (
        <div className="pl-11 flex flex-col gap-2.5">
          {comment.replies.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              isReply
              canDelete={canDelete}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PostDetail({ post }: { post: Post }) {
  const router = useRouter();
  const myUsername = useCachedUsername();
  const like = useLikeToggle(post.is_liked, post.like_count, () => api.likePost(post.id));
  const [saved, setSaved] = useState(post.is_saved);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [commentError, setCommentError] = useState("");
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<{ username: string; threadId: string } | null>(null);
  const [posting, setPosting] = useState(false);
  const [slide, setSlide] = useState(0);
  const [toast, setToast] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (post.comments_disabled) return;
    api
      .comments(post.id)
      .then(setComments)
      .catch(() => {
        setComments([]);
        setCommentError("Couldn't load comments.");
      });
  }, [post.id, post.comments_disabled]);

  function flash(message: string | null) {
    if (!message) return;
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  }

  function toggleSave() {
    const wasSaved = saved;
    setSaved(!wasSaved);
    api.savePost(post.id).then((res) => setSaved(res.saved)).catch(() => setSaved(wasSaved));
  }

  function handleReply(username: string, threadId: string) {
    setReplyTo({ username, threadId });
    setDraft(`@${username} `);
    inputRef.current?.focus();
  }

  const isPostOwner = myUsername === post.author.username;
  const canDelete = (c: Comment) => isPostOwner || c.author.username === myUsername;

  async function handleDelete(target: Comment) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api.deleteComment(target.id);
    } catch {
      setCommentError("Couldn't delete that comment.");
      return;
    }
    setComments((list) =>
      (list ?? [])
        .filter((c) => c.id !== target.id)
        .map((c) => (c.id === target.parent ? { ...c, replies: c.replies.filter((r) => r.id !== target.id) } : c))
    );
    // Deleting a thread's top comment deletes its replies with it.
    setCommentCount((n) => Math.max(0, n - 1 - (target.parent ? 0 : target.replies.length)));
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setPosting(true);
    setCommentError("");
    try {
      const created = await api.addComment(post.id, draft.trim(), replyTo?.threadId);
      setComments((list) => {
        const current = list ?? [];
        if (!created.parent) return [...current, created];
        return current.map((c) => (c.id === created.parent ? { ...c, replies: [...c.replies, created] } : c));
      });
      setCommentCount((n) => n + 1);
      setDraft("");
      setReplyTo(null);
    } catch {
      setCommentError("Comment didn't post. Try again.");
    } finally {
      setPosting(false);
    }
  }

  const media = post.media[slide];

  return (
    <main className="flex-1 max-w-md mx-auto w-full flex flex-col min-h-svh pb-4">
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 sticky top-0 bg-background z-10">
        <button
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
          aria-label="Back"
          className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center"
        >
          <ArrowLeft size={16} />
        </button>
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
        </div>

        {/* Media */}
        {media && (
          <div className="px-4">
            <div className="relative w-full aspect-square bg-border overflow-hidden rounded-2xl">
              <MediaView key={media.id} url={media.file_url} type={media.media_type} />
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
          <button onClick={like.toggle} aria-label={like.liked ? "Unlike" : "Like"} aria-pressed={like.liked} className="flex items-center gap-1.5">
            <Heart size={20} className={like.liked ? "fill-red-500 text-red-500" : "text-foreground"} />
            {!post.like_count_hidden && <span className="text-[13px] font-semibold">{fmtCount(like.count)}</span>}
          </button>
          {!post.comments_disabled && (
            <button onClick={() => inputRef.current?.focus()} aria-label="Comment" className="flex items-center gap-1.5 text-foreground/80">
              <MessageCircle size={20} />
              <span className="text-[13px] font-semibold">{fmtCount(commentCount)}</span>
            </button>
          )}
          <button
            onClick={async () => flash(await shareLink(`/post/${post.id}`, `Post by ${post.author.username}`))}
            aria-label="Share"
            className="text-foreground/80"
          >
            <Send size={19} />
          </button>
          <button onClick={toggleSave} aria-label={saved ? "Unsave" : "Save"} aria-pressed={saved} className="ml-auto">
            <Bookmark size={19} className={saved ? "fill-foreground text-foreground" : "text-foreground"} />
          </button>
        </div>
        {toast && <p className="px-4 text-xs font-semibold text-brand-dark">{toast}</p>}

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
          {!post.comments_disabled && comments?.length === 0 && !commentError && (
            <p className="text-center text-xs text-muted py-6">No comments yet. Be the first to say something.</p>
          )}
          {comments?.map((c) => (
            <CommentRow key={c.id} comment={c} canDelete={canDelete} onReply={handleReply} onDelete={handleDelete} />
          ))}
        </div>
      </div>

      {!post.comments_disabled && (
        <div className="sticky bottom-0 bg-background border-t border-border">
          {commentError && <p className="px-4 pt-2 text-xs text-red-500">{commentError}</p>}
          <form onSubmit={handleSubmitComment} className="flex items-center gap-2 px-4 py-3">
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
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={500}
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
        </div>
      )}
    </main>
  );
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .post(id)
      .then(setPost)
      .catch(() => setError("This post couldn't be found."));
  }, [id]);

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

  return <PostDetail key={post.id} post={post} />;
}
