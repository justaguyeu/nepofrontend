"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  MapPin,
  Trash2,
} from "lucide-react";
import { Post } from "@/lib/types";
import { api } from "@/lib/api";
import { useLikeToggle } from "@/lib/useLikeToggle";
import { useCachedUsername } from "@/lib/useCurrentUser";
import { avatarUrl, formatCount as fmtCount, shareLink, timeAgo } from "@/lib/utils";
import MediaView from "./MediaView";

export default function PostCard({ post, onDeleted }: { post: Post; onDeleted?: (id: string) => void }) {
  const like = useLikeToggle(post.is_liked, post.like_count, () => api.likePost(post.id));
  const [saved, setSaved] = useState(post.is_saved);
  const [slide, setSlide] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const myUsername = useCachedUsername();
  const isMine = myUsername === post.author.username;

  function flash(message: string | null) {
    if (!message) return;
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  }

  function toggleSave() {
    const wasSaved = saved;
    setSaved(!wasSaved);
    api
      .savePost(post.id)
      .then((res) => setSaved(res.saved))
      .catch(() => setSaved(wasSaved));
  }

  async function handleDelete() {
    setMenuOpen(false);
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    try {
      await api.deletePost(post.id);
      onDeleted?.(post.id);
    } catch {
      flash("Couldn't delete the post");
    }
  }

  const media = post.media[slide];

  const captionWords = post.caption?.split(" ") ?? [];
  const isLong = captionWords.length > 14;
  const displayedCaption = isLong && !expanded
    ? captionWords.slice(0, 14).join(" ") + "..."
    : post.caption;

  return (
    <article className="relative bg-surface rounded-3xl mx-4 mb-4 overflow-hidden card-shadow border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full overflow-hidden relative shrink-0 bg-border">
            <Image src={avatarUrl(post.author)} alt={post.author.username} fill className="object-cover" unoptimized />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold flex items-center gap-1 text-foreground">
              {post.author.username}
              {post.author.is_business && (
                <span className="text-[9px] font-bold bg-brand text-pill rounded px-1 py-0.5 leading-none">BIZ</span>
              )}
              {post.author.is_verified && (
                <span className="h-3.5 w-3.5 rounded-full bg-brand-dark inline-flex items-center justify-center text-white text-[8px] font-black">✓</span>
              )}
            </p>
            <p className="text-[11px] text-muted flex items-center gap-1">
              {timeAgo(post.created_at)}
              {/* sponsored / location indicator */}
              {post.location_name && (
                <><span>·</span><MapPin size={9} className="inline" /><span className="truncate max-w-[80px]">{post.location_name}</span></>
              )}
            </p>
          </div>
        </Link>
        {isMine && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="More options"
              aria-expanded={menuOpen}
              className="text-muted p-1 rounded-full hover:bg-border transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 bg-surface border border-border rounded-xl card-shadow py-1 min-w-[140px]">
                <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-border">
                  <Trash2 size={14} /> Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Caption (above media like reference) */}
      {post.caption && (
        <div className="px-4 pb-3 text-sm leading-snug text-foreground/90">
          {displayedCaption}
          {isLong && !expanded && (
            <button onClick={() => setExpanded(true)} className="text-brand-dark font-semibold ml-1">
              More...
            </button>
          )}
          {post.hashtags.length > 0 && (
            <span className="text-brand-dark ml-1">{post.hashtags.map((h) => `#${h.name}`).join(" ")}</span>
          )}
        </div>
      )}

      {/* Media */}
      {media && (
        <div className="px-4">
          <div className="relative w-full aspect-[4/3.5] bg-border overflow-hidden rounded-2xl">
            <MediaView key={media.id} url={media.file_url} type={media.media_type} />
            {/* carousel dots */}
            {post.media.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {post.media.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === slide ? "w-4 bg-white" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions + stats */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* Like */}
            <button onClick={like.toggle} aria-label={like.liked ? "Unlike" : "Like"} aria-pressed={like.liked} className="flex items-center gap-1.5 text-foreground/80">
              <Heart
                size={18}
                className={like.liked ? "fill-red-500 text-red-500" : "text-foreground"}
              />
              {!post.like_count_hidden && (
                <span className="text-[13px] font-semibold">{fmtCount(like.count)}</span>
              )}
            </button>
            {/* Comments */}
            {!post.comments_disabled && (
              <Link href={`/post/${post.id}`} aria-label="Comments" className="flex items-center gap-1.5 text-foreground/80">
                <MessageCircle size={18} className="text-foreground" />
                <span className="text-[13px] font-semibold">{fmtCount(post.comment_count)}</span>
              </Link>
            )}
            {/* Share */}
            <button
              onClick={async () => flash(await shareLink(`/post/${post.id}`, `Post by ${post.author.username}`))}
              aria-label="Share"
              className="text-foreground/80"
            >
              <Send size={18} className="text-foreground" />
            </button>
          </div>
          {/* Save (on the right) */}
          <button onClick={toggleSave} aria-label={saved ? "Unsave" : "Save"} aria-pressed={saved}>
            <Bookmark size={18} className={saved ? "fill-foreground text-foreground" : "text-foreground"} />
          </button>
        </div>

        {/* "View all X comments" */}
        {!post.comments_disabled && post.comment_count > 0 && (
          <Link href={`/post/${post.id}`} className="text-xs text-muted mt-2 block">
            View all {fmtCount(post.comment_count)} comments
          </Link>
        )}
      </div>

      {toast && (
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-pill text-white text-xs font-semibold rounded-full px-3 py-1.5">
          {toast}
        </p>
      )}
    </article>
  );
}
