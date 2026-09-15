"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Play,
  Send,
  MapPin,
} from "lucide-react";
import { Post } from "@/lib/types";
import { api } from "@/lib/api";
import { avatarUrl, formatCount as fmtCount, timeAgo } from "@/lib/utils";

export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [slide, setSlide] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const toggleLike = () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    api.likePost(post.id).catch(() => {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    });
  };

  const media = post.media[slide];

  const captionWords = post.caption?.split(" ") ?? [];
  const isLong = captionWords.length > 14;
  const displayedCaption = isLong && !expanded
    ? captionWords.slice(0, 14).join(" ") + "..."
    : post.caption;

  return (
    <article className="bg-surface rounded-3xl mx-4 mb-4 overflow-hidden card-shadow border border-border">
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
        <button aria-label="More options" className="text-muted p-1 rounded-full hover:bg-border transition-colors">
          <MoreHorizontal size={18} />
        </button>
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
        <div className="relative w-full aspect-[4/4.5] bg-border overflow-hidden">
          <Image src={media.file_url} alt="" fill className="object-cover" unoptimized />
          {media.media_type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="h-14 w-14 rounded-full bg-black/35 backdrop-blur flex items-center justify-center">
                <Play size={22} className="text-white fill-white ml-0.5" />
              </span>
            </div>
          )}
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
          {/* volume icon (bottom right) */}
          {media.media_type === "video" && (
            <button className="absolute bottom-3 right-3 h-7 w-7 rounded-full bg-black/30 backdrop-blur flex items-center justify-center text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
            </button>
          )}
        </div>
      )}

      {/* Actions + stats */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* Like */}
            <button onClick={toggleLike} aria-label="Like" className="flex items-center gap-1.5">
              <Heart
                size={22}
                className={liked ? "fill-red-500 text-red-500" : "text-foreground"}
              />
              {!post.like_count_hidden && (
                <span className="text-sm font-semibold">{fmtCount(likeCount)}</span>
              )}
            </button>
            {/* Comments */}
            {!post.comments_disabled && (
              <Link href={`/post/${post.id}`} className="flex items-center gap-1.5">
                <MessageCircle size={21} className="text-foreground" />
                {post.comment_count > 0 && (
                  <span className="text-sm font-semibold">{fmtCount(post.comment_count)}</span>
                )}
              </Link>
            )}
            {/* Share */}
            <button aria-label="Share" className="flex items-center gap-1.5">
              <Send size={20} className="text-foreground" />
              {post.comment_count > 0 && (
                <span className="text-sm font-semibold">{fmtCount(post.comment_count)}</span>
              )}
            </button>
          </div>
        </div>

        {/* "View all X comments" */}
        {!post.comments_disabled && post.comment_count > 0 && (
          <Link href={`/post/${post.id}`} className="text-xs text-muted mt-2 block">
            View all {fmtCount(post.comment_count)} comments
          </Link>
        )}
      </div>
    </article>
  );
}
