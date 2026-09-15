"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Story, UserProfile } from "@/lib/types";
import { avatarUrl } from "@/lib/utils";

export default function StoriesRow({
  me,
  stories,
}: {
  me: UserProfile;
  stories: Story[];
}) {
  const groups = Object.values(
    stories.reduce<Record<string, { author: Story["author"]; stories: Story[] }>>((acc, s) => {
      const key = s.author.username;
      if (!acc[key]) acc[key] = { author: s.author, stories: [] };
      acc[key].stories.push(s);
      return acc;
    }, {})
  ).filter((g) => g.author.username !== me.username);

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-4 pt-1">
      {/* "Me" / Add Story */}
      <Link href="/create/story" className="flex flex-col items-center gap-1.5 shrink-0 w-[60px]">
        <div className="relative h-[56px] w-[56px]">
          {/* avatar */}
          <div className="h-full w-full rounded-full overflow-hidden border-2 border-border bg-border">
            <Image src={avatarUrl(me)} alt={me.username} fill className="object-cover" unoptimized />
          </div>
          {/* green + badge */}
          <span className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-brand border-2 border-background flex items-center justify-center shadow">
            <Plus size={10} strokeWidth={3.5} className="text-pill" />
          </span>
        </div>
        <span className="text-[10.5px] font-medium text-muted leading-none">Me</span>
      </Link>

      {groups.map((g) => {
        const allViewed = g.stories.every((s) => s.is_viewed);
        return (
          <Link
            key={g.author.id}
            href={`/profile/${g.author.username}`}
            className="flex flex-col items-center gap-1.5 shrink-0 w-[60px]"
          >
            <div className="relative h-[56px] w-[56px]">
              {allViewed ? (
                <div className="h-full w-full rounded-full overflow-hidden border-2 border-border bg-border">
                  <Image src={avatarUrl(g.author)} alt={g.author.username} fill className="object-cover" unoptimized />
                </div>
              ) : (
                /* unviewed — green gradient ring */
                <div className="story-ring h-full w-full rounded-full">
                  <div className="h-full w-full rounded-full p-[2px] bg-transparent">
                    <div className="h-full w-full rounded-full overflow-hidden border-2 border-background relative">
                      <Image src={avatarUrl(g.author)} alt={g.author.username} fill className="object-cover" unoptimized />
                    </div>
                  </div>
                </div>
              )}
              {/* "Live" badge – only for verified / future use */}
              {g.author.is_verified && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1.5 py-px text-[8px] font-bold uppercase bg-red-500 text-white rounded-full leading-none">
                  Live
                </span>
              )}
            </div>
            <span className="text-[10.5px] font-medium text-foreground truncate w-full text-center leading-none">
              {g.author.full_name?.split(" ")[0] || g.author.username}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
