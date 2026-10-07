"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Compass,
  Heart,
  Home,
  MessageCircle,
  Music2,
  Play,
  Send,
  User,
  Volume2,
  VolumeX,
  Clapperboard,
} from "lucide-react";
import { Reel } from "@/lib/types";
import { api, type FollowStatus } from "@/lib/api";
import { avatarUrl, formatCount as fmtCount, shareLink } from "@/lib/utils";
import { useLikeToggle } from "@/lib/useLikeToggle";
import { useCachedUsername } from "@/lib/useCurrentUser";

export default function ReelCard({ reel }: { reel: Reel }) {
  const like = useLikeToggle(reel.is_liked, reel.like_count, () => api.likeReel(reel.id));
  const [muted, setMuted] = useState(true);
  const [followStatus, setFollowStatus] = useState<FollowStatus>(reel.is_following_author ? "accepted" : "none");
  const [followBusy, setFollowBusy] = useState(false);
  const [toast, setToast] = useState("");
  const myUsername = useCachedUsername();
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewCounted = useRef(false);

  // Intersection observer to auto-play when visible
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
          // One view per time the reel is loaded, not one per scroll past.
          if (!viewCounted.current) {
            viewCounted.current = true;
            api.viewReel(reel.id).catch(() => {});
          }
        } else {
          el.pause();
        }
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reel.id]);

  const handleFollow = () => {
    if (followBusy) return;
    setFollowBusy(true);
    api
      .follow(reel.author.username)
      .then((res) => setFollowStatus(res.status))
      .catch(() => {})
      .finally(() => setFollowBusy(false));
  };

  const handleShare = async () => {
    const message = await shareLink(`/reel/${reel.id}`, `Reel by ${reel.author.username}`);
    if (message) {
      setToast(message);
      setTimeout(() => setToast(""), 2000);
    }
  };

  const isMine = myUsername === reel.author.username;

  return (
    <section className="relative h-[calc(100svh)] w-full snap-start shrink-0 bg-black text-white overflow-hidden">
      {/* Video or thumbnail */}
      {reel.video_url ? (
        <video
          ref={videoRef}
          src={reel.video_url}
          loop
          muted={muted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <Image
          src={reel.thumbnail_url}
          alt={reel.caption}
          fill
          className="object-cover"
          unoptimized
          priority
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75 pointer-events-none" />

      {/* Top bar */}
      <div className="absolute top-5 left-4 right-4 flex items-center justify-between">
        <p className="text-lg font-bold tracking-tight">Reels</p>
        <Link href="/create" aria-label="Create a reel">
          <Camera size={21} />
        </Link>
      </div>

      {/* Center play overlay (only for thumbnail) */}
      {!reel.video_url && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="h-16 w-16 rounded-full bg-black/30 backdrop-blur flex items-center justify-center">
            <Play size={26} className="fill-white text-white ml-1" />
          </span>
        </div>
      )}

      {/* RIGHT rail */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
        {/* Like */}
        <button onClick={like.toggle} aria-label={like.liked ? "Unlike" : "Like"} aria-pressed={like.liked} className="flex flex-col items-center gap-1">
          <span className="h-11 w-11 rounded-full bg-black/30 backdrop-blur flex items-center justify-center">
            <Heart size={21} className={like.liked ? "fill-red-500 text-red-500" : "text-white"} />
          </span>
          <span className="text-xs font-semibold">{fmtCount(like.count)}</span>
        </button>
        {/* Comment */}
        <Link href={`/reel/${reel.id}`} aria-label="Comments" className="flex flex-col items-center gap-1">
          <span className="h-11 w-11 rounded-full bg-black/30 backdrop-blur flex items-center justify-center">
            <MessageCircle size={20} />
          </span>
          <span className="text-xs font-semibold">{fmtCount(reel.comment_count)}</span>
        </Link>
        {/* Share */}
        <button onClick={handleShare} aria-label="Share" className="flex flex-col items-center gap-1">
          <span className="h-11 w-11 rounded-full bg-black/30 backdrop-blur flex items-center justify-center">
            <Send size={18} />
          </span>
        </button>
        {/* Author avatar */}
        <Link href={`/profile/${reel.author.username}`} aria-label={reel.author.username} className="h-10 w-10 rounded-full overflow-hidden relative border-2 border-white mt-1">
          <Image src={avatarUrl(reel.author)} alt="" fill className="object-cover" unoptimized />
        </Link>
      </div>

      {toast && (
        <p className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white text-xs font-semibold rounded-full px-3 py-1.5">
          {toast}
        </p>
      )}

      {/* Bottom info */}
      <div className="absolute left-4 right-20 bottom-24">
        <div className="flex items-center gap-2 mb-2">
          <Link href={`/profile/${reel.author.username}`} className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full overflow-hidden relative border border-white/60">
              <Image src={avatarUrl(reel.author)} alt="" fill className="object-cover" unoptimized />
            </div>
            <p className="text-sm font-bold">{reel.author.username}</p>
          </Link>
          {!isMine && (
            <button
              onClick={handleFollow}
              disabled={followBusy}
              className={`px-3 h-7 rounded-full text-xs font-bold transition-all ${
                followStatus !== "none"
                  ? "bg-white/20 border border-white/40 text-white"
                  : "bg-brand text-pill"
              }`}
            >
              {followStatus === "accepted" ? "Following" : followStatus === "pending" ? "Requested" : "Follow"}
            </button>
          )}
        </div>
        {reel.caption && (
          <p className="text-sm leading-snug line-clamp-2 text-white/90">{reel.caption}</p>
        )}
        {reel.audio_title && (
          <p className="flex items-center gap-1.5 text-xs text-white/75 mt-1.5">
            <Music2 size={12} /> {reel.audio_title}
          </p>
        )}
      </div>

      {/* Bottom pill nav */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[min(90vw,380px)]">
        <div className="flex items-center justify-between nav-pill rounded-full px-3 py-2.5">
          <Link href="/" className="h-9 w-9 rounded-full flex items-center justify-center text-white/60 hover:text-white">
            <Home size={18} />
          </Link>
          <Link href="/explore" className="h-9 w-9 rounded-full flex items-center justify-center text-white/60 hover:text-white">
            <Compass size={18} />
          </Link>
          <span className="h-9 w-9 rounded-full bg-brand flex items-center justify-center text-pill">
            <Clapperboard size={17} strokeWidth={2.5} />
          </span>
          <Link href="/messages" className="h-9 w-9 rounded-full flex items-center justify-center text-white/60 hover:text-white">
            <Send size={17} />
          </Link>
          <Link
            href={myUsername ? `/profile/${myUsername}` : "/settings"}
            className="h-9 w-9 rounded-full flex items-center justify-center text-white/60 hover:text-white"
          >
            <User size={18} />
          </Link>
        </div>
      </div>

      {/* Mute toggle */}
      <button
        aria-label={muted ? "Unmute" : "Mute"}
        onClick={() => setMuted((m) => !m)}
        className="absolute bottom-[70px] left-3 h-9 w-9 rounded-full bg-black/30 backdrop-blur flex items-center justify-center text-white"
      >
        {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
    </section>
  );
}
