"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, MapPin, Clapperboard, BookImage } from "lucide-react";
import { api } from "@/lib/api";

type Mode = "post" | "reel";

export default function CreatePostPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("post");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [audioTitle, setAudioTitle] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles(picked);
    setPreviews(picked.map((f) => URL.createObjectURL(f)));
  }

  async function handlePost() {
    setPosting(true);
    setError("");
    try {
      if (mode === "reel") {
        const videoFile = files[0];
        if (!videoFile) throw new Error("No file");
        const { url: video_url } = await api.uploadMedia(videoFile, "reels");
        await api.createReel({ video_url, caption, audio_title: audioTitle });
      } else {
        const uploaded = await Promise.all(files.map((f) => api.uploadMedia(f, "posts")));
        const hashtag_names = (caption.match(/#\w+/g) ?? []).map((h) => h.slice(1));
        await api.createPost({
          caption,
          location_name: location,
          media_urls: uploaded.map((u) => u.url),
          hashtag_names,
        });
      }
      router.push("/");
    } catch {
      setError(
        "Couldn't publish — check that the backend and Supabase storage bucket are configured."
      );
    } finally {
      setPosting(false);
    }
  }

  const isVideo = files[0]?.type.startsWith("video");

  return (
    <main className="flex-1 pb-10 max-w-md mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <Link
          href="/"
          className="h-9 w-9 rounded-full bg-surface border border-border card-shadow flex items-center justify-center"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-base font-bold">
          {mode === "reel" ? "New Reel" : "New Post"}
        </h1>
        <button
          onClick={handlePost}
          disabled={files.length === 0 || posting}
          className="text-brand-dark text-sm font-bold disabled:opacity-40"
        >
          {posting ? "Posting..." : "Share"}
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-2 px-4 mb-4">
        {(["post", "reel"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setFiles([]); setPreviews([]); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              mode === m
                ? "bg-brand text-pill shadow"
                : "bg-surface border border-border text-muted"
            }`}
          >
            {m === "post" ? <BookImage size={14} /> : <Clapperboard size={14} />}
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
        <Link
          href="/create/story"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-surface border border-border text-muted"
        >
          Story
        </Link>
      </div>

      <div className="px-4">
        {previews.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
            {previews.map((src, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden shrink-0 bg-border"
                style={{ height: mode === "reel" ? "240px" : "160px", width: mode === "reel" ? "135px" : "128px" }}>
                {isVideo ? (
                  <video src={src} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <Image src={src} alt="" fill className="object-cover" unoptimized />
                )}
              </div>
            ))}
            {/* add more (post only) */}
            {mode === "post" && (
              <label className="flex flex-col items-center justify-center h-40 w-20 rounded-2xl border-2 border-dashed border-border text-muted shrink-0 cursor-pointer">
                <ImagePlus size={20} />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={onPickFiles}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-3 h-52 rounded-3xl border-2 border-dashed border-border bg-surface text-muted mb-4 cursor-pointer hover:border-brand transition-colors">
            {mode === "reel" ? <Clapperboard size={28} className="text-brand" /> : <ImagePlus size={28} className="text-brand" />}
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {mode === "reel" ? "Choose a video" : "Choose photos or a video"}
              </p>
              <p className="text-xs text-muted mt-0.5">
                {mode === "reel" ? "Up to 90 seconds" : "Up to 10 files"}
              </p>
            </div>
            <input
              type="file"
              accept={mode === "reel" ? "video/*" : "image/*,video/*"}
              multiple={mode === "post"}
              onChange={onPickFiles}
              className="hidden"
            />
          </label>
        )}

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={mode === "reel" ? "Add a caption... describe your reel" : "Write a caption... use #hashtags"}
          rows={3}
          className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-brand resize-none"
        />

        {mode === "post" && (
          <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2.5 mt-3">
            <MapPin size={15} className="text-muted shrink-0" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted"
            />
          </div>
        )}

        {mode === "reel" && (
          <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2.5 mt-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            <input
              value={audioTitle}
              onChange={(e) => setAudioTitle(e.target.value)}
              placeholder="Audio / music title"
              className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted"
            />
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
      </div>
    </main>
  );
}
