"use client";

import React from "react";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, Globe, Grid3x3, Play, Bookmark, Settings, MessageCircle } from "lucide-react";
import { UserProfile } from "@/lib/types";
import { api } from "@/lib/api";
import { avatarUrl, formatCount } from "@/lib/utils";

export default function ProfileHeader({
  profile,
  isMe = false,
}: {
  profile: UserProfile;
  isMe?: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(profile.is_following);
  const [followerCount, setFollowerCount] = useState(profile.followers_count);
  const [messaging, setMessaging] = useState(false);

  async function handleMessage() {
    setMessaging(true);
    try {
      const convo = await api.startConversation(profile.username);
      router.push(`/messages/${convo.id}`);
    } finally {
      setMessaging(false);
    }
  }

  return (
    <div className="bg-surface rounded-b-3xl card-shadow overflow-hidden pt-4 pb-1 mb-4 border-b border-border">
      <div className="px-4">
        {/* Top row: avatar + name + follow/settings */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="h-[64px] w-[64px] rounded-full overflow-hidden relative border border-border">
                <Image src={avatarUrl(profile)} alt={profile.username} fill className="object-cover" unoptimized />
              </div>
              {profile.is_business && (
                <span className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-brand border-2 border-background flex items-center justify-center">
                  <BadgeCheck size={11} strokeWidth={2.75} className="text-pill" />
                </span>
              )}
            </div>
            <div className="mt-1">
              <p className="text-[17px] font-extrabold flex items-center gap-1.5 text-foreground leading-none mb-1">
                {profile.full_name || profile.username}
                {profile.is_verified && (
                  <span className="h-4 w-4 rounded-full bg-brand-dark inline-flex items-center justify-center text-white text-[9px] font-black">✓</span>
                )}
              </p>
              <p className="text-[13px] text-muted font-medium">@{profile.username}</p>
            </div>
          </div>

          {isMe ? (
            <Link
              href="/settings"
              className="mt-1 h-9 w-9 rounded-full bg-surface border border-border card-shadow flex items-center justify-center"
            >
              <Settings size={15} />
            </Link>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => {
                  const wasFollowing = following;
                  setFollowing(!wasFollowing);
                  setFollowerCount((c) => (wasFollowing ? c - 1 : c + 1));
                  api.follow(profile.username).catch(() => {
                    setFollowing(wasFollowing);
                    setFollowerCount((c) => (wasFollowing ? c + 1 : c - 1));
                  });
                }}
                className={`px-5 h-9 rounded-full text-[13px] font-bold transition-all ${
                  following
                    ? "bg-surface border border-border text-foreground shadow-sm"
                    : "bg-brand text-pill shadow"
                }`}
              >
                {following ? "Following" : "Follow"}
              </button>
              <button
                onClick={handleMessage}
                disabled={messaging}
                aria-label="Message"
                className="h-9 w-9 rounded-full bg-surface border border-border card-shadow flex items-center justify-center disabled:opacity-50"
              >
                <MessageCircle size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="mt-5">
          {profile.bio && (
            <p className="text-[12px] text-muted font-medium flex flex-col gap-1">
              {profile.bio.split("\n").map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </p>
          )}
          {profile.website && (
            <a
              href={`https://${profile.website}`}
              className="flex items-center gap-1 text-[12px] font-semibold text-brand-dark mt-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe size={11} /> {profile.website}
            </a>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between mt-6 mb-2">
          {[
            { label: "Posts", value: profile.posts_count },
            { label: "Followers", value: followerCount },
            { label: "Following", value: profile.following_count },
          ].map(({ label, value }) => (
            <div key={label} className="text-center flex-1">
              <p className="text-[15px] font-black tracking-tight">{formatCount(value)}</p>
              <p className="text-[11px] font-medium text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story highlights */}
      {profile.highlights.length > 0 && (
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-3.5">
          {profile.highlights.map((h) => (
            <div key={h.id} className="flex flex-col items-center gap-1.5 shrink-0 w-16">
              <div className="h-14 w-14 rounded-full overflow-hidden relative border-2 border-border">
                <Image src={h.cover_url} alt={h.title} fill className="object-cover" unoptimized />
              </div>
              <span className="text-[10.5px] font-medium truncate w-full text-center">{h.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfileTabs({
  active,
  onChange,
}: {
  active: "grid" | "reels" | "tagged";
  onChange: (tab: "grid" | "reels" | "tagged") => void;
}) {
  const tabs: { id: "grid" | "reels" | "tagged"; icon: React.ElementType }[] = [
    { id: "grid", icon: Grid3x3 },
    { id: "reels", icon: Play },
    { id: "tagged", icon: Bookmark },
  ];
  return (
    <div className="flex border-b border-border mt-1">
      {tabs.map(({ id, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 flex items-center justify-center py-3.5 border-b-2 transition-colors ${
            active === id
              ? "border-brand text-foreground"
              : "border-transparent text-muted"
          }`}
        >
          <Icon size={18} strokeWidth={active === id ? 2.5 : 2} />
        </button>
      ))}
    </div>
  );
}
