"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { api } from "@/lib/api";

export default function CreateStoryPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleShare() {
    if (!file) return;
    setPosting(true);
    setError("");
    try {
      const { url } = await api.uploadMedia(file, "stories");
      const mediaType = file.type.startsWith("video") ? "video" : "image";
      await api.createStory({ media_type: mediaType, file_url: url, caption });
      router.push("/");
    } catch {
      setError("Couldn't upload your story — check that the backend and Supabase bucket are configured.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <main className="flex-1 min-h-svh max-w-md mx-auto w-full flex flex-col pb-10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <Link
          href="/"
          className="h-9 w-9 rounded-full bg-surface border border-border card-shadow flex items-center justify-center"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-base font-bold">New Story</h1>
        <button
          onClick={handleShare}
          disabled={!file || posting}
          className="text-brand-dark text-sm font-bold disabled:opacity-40"
        >
          {posting ? "Sharing..." : "Share"}
        </button>
      </div>

      <div className="flex-1 flex flex-col px-4 gap-4">
        {preview ? (
          <div className="relative rounded-3xl overflow-hidden aspect-[9/16] bg-border w-full">
            {file?.type.startsWith("video") ? (
              <video src={preview} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : (
              <Image src={preview} alt="Story preview" fill className="object-cover" unoptimized />
            )}
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <label
            className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-surface aspect-[9/16] cursor-pointer text-muted hover:border-brand transition-colors"
          >
            <ImagePlus size={32} className="text-brand" />
            <p className="text-sm font-semibold text-foreground">Tap to pick a photo or video</p>
            <p className="text-xs text-muted">Stories disappear after 24 hours</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              onChange={onPick}
              className="hidden"
            />
          </label>
        )}

        {preview && (
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            rows={2}
            className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-brand resize-none"
          />
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        {!preview && (
          <button
            onClick={() => fileRef.current?.click()}
            className="bg-brand text-pill font-bold rounded-2xl py-3.5 text-sm w-full"
          >
            Choose from gallery
          </button>
        )}
      </div>
    </main>
  );
}
