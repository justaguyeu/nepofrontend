"use client";

import Image from "next/image";
import { Play } from "lucide-react";

/**
 * Renders one post/reel media item inside a `relative` parent. Videos get a
 * real <video> element (an <img> can't display a video URL). `thumbnail`
 * mode is for grids: a muted first frame with a small play badge.
 */
export default function MediaView({
  url,
  type,
  thumbnail = false,
}: {
  url: string;
  type: "image" | "video";
  thumbnail?: boolean;
}) {
  if (type === "video") {
    return thumbnail ? (
      <>
        {/* #t=0.1 makes browsers paint the first frame instead of a blank box */}
        <video src={`${url}#t=0.1`} muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover" />
        <Play size={13} className="absolute top-1.5 left-1.5 text-white fill-white drop-shadow" />
      </>
    ) : (
      <video src={url} controls playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover bg-black" />
    );
  }
  return <Image src={url} alt="" fill className="object-cover" unoptimized />;
}
