"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Mail, MapPin, Phone, Play, Share2, Store } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ProfileHeader, { ProfileTabs } from "@/components/ProfileHeader";
import { api } from "@/lib/api";
import { getCachedUsername } from "@/lib/auth";
import { formatCount } from "@/lib/utils";
import type { BusinessProfile, Post, Reel, UserProfile } from "@/lib/types";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [tab, setTab] = useState<"grid" | "reels" | "tagged">("grid");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [error, setError] = useState("");
  const [isMe, setIsMe] = useState(false);

  useEffect(() => {
    setIsMe(getCachedUsername() === username);
    api
      .profile(username)
      .then((p) => {
        setProfile(p);
        if (p.is_business) api.business(username).then(setBusiness).catch(() => {});
      })
      .catch(() => setError("This profile couldn't be found."));
    api.postsByUser(username).then(setPosts).catch(() => {});
    api.reelsByUser(username).then(setReels).catch(() => {});
  }, [username]);

  return (
    <main className="flex-1 pb-28 max-w-md mx-auto w-full">
      <div className="flex items-center justify-between px-4 pt-5">
        <Link href="/" className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center">
          <ArrowLeft size={16} />
        </Link>
        <p className="text-sm font-semibold">@{username}</p>
        <button aria-label="Share" className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center">
          <Share2 size={15} />
        </button>
      </div>

      {error && <p className="px-4 pt-8 text-center text-sm text-muted">{error}</p>}

      {!profile && !error && (
        <p className="px-4 pt-16 text-center text-sm text-muted">Loading profile...</p>
      )}

      {profile && (
        <>
          <ProfileHeader profile={profile} isMe={isMe} />

          {profile.is_business && business && (
            <div className="mx-4 mb-4 bg-surface border border-border rounded-2xl px-4 py-3.5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Store size={15} className="text-brand" />
                <span className="text-sm font-bold">
                  {business.category?.name ?? "Business"}
                </span>
              </div>
              {business.address && (
                <p className="flex items-center gap-2 text-xs text-muted">
                  <MapPin size={13} className="shrink-0" /> {business.address}
                </p>
              )}
              {business.contact_phone && (
                <a href={`tel:${business.contact_phone}`} className="flex items-center gap-2 text-xs text-muted">
                  <Phone size={13} className="shrink-0" /> {business.contact_phone}
                </a>
              )}
              {business.contact_email && (
                <a href={`mailto:${business.contact_email}`} className="flex items-center gap-2 text-xs text-muted">
                  <Mail size={13} className="shrink-0" /> {business.contact_email}
                </a>
              )}
              {business.opening_hours && Object.keys(business.opening_hours).length > 0 && (
                <div className="text-xs text-muted flex flex-col gap-0.5 pt-1 border-t border-border mt-0.5">
                  {Object.entries(business.opening_hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize">{day.replace("_", "-")}</span>
                      <span>{hours}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <ProfileTabs active={tab} onChange={setTab} />

          {tab === "grid" && (
            posts.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-2 py-14 px-6">
                <ImagePlus size={22} className="text-muted" />
                <p className="text-sm text-muted">
                  {isMe ? "You haven't posted anything yet." : "No posts yet."}
                </p>
                {isMe && (
                  <Link href="/create" className="text-sm text-brand-dark font-semibold mt-1">
                    Share your first post
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 px-1 mt-1">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="relative aspect-square bg-border rounded-2xl overflow-hidden"
                  >
                    {post.media[0] && (
                      <Image src={post.media[0].file_url} alt="" fill className="object-cover" unoptimized />
                    )}
                    <span className="absolute bottom-2 left-2 flex items-center gap-0.5 text-[10px] font-bold text-white bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                      {formatCount(post.like_count)}
                    </span>
                  </Link>
                ))}
              </div>
            )
          )}

          {tab === "reels" && (
            reels.length === 0 ? (
              <div className="py-14 text-center text-sm text-muted">
                {isMe ? "You haven't posted any reels yet." : "No reels yet."}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                {reels.map((reel) => (
                  <Link key={reel.id} href={`/reel/${reel.id}`} className="relative aspect-3/4 bg-border block">
                    {reel.thumbnail_url && (
                      <Image src={reel.thumbnail_url} alt="" fill className="object-cover" unoptimized />
                    )}
                    <Play size={14} className="absolute top-1.5 left-1.5 text-white fill-white" />
                  </Link>
                ))}
              </div>
            )
          )}

          {tab === "tagged" && (
            <div className="py-14 text-center text-sm text-muted">No tagged posts yet</div>
          )}
        </>
      )}

      <BottomNav />
    </main>
  );
}
