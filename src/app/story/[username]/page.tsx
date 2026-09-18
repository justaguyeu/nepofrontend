"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { Story } from "@/lib/types";
import { avatarUrl } from "@/lib/utils";

export default function StoryViewerPage() {
  const router = useRouter();
  const { username } = useParams();
  
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Fetch stories on load
  useEffect(() => {
    async function loadStories() {
      try {
        const feed = await api.storyFeed();
        // Filter stories by the selected user
        const userStories = feed.filter((s) => s.author.username === username);
        if (userStories.length === 0) {
          router.push("/");
          return;
        }
        setStories(userStories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStories();
  }, [username, router]);

  const currentStory = stories[currentIndex];

  // Auto-advance logic
  useEffect(() => {
    if (!currentStory) return;
    
    // Mark as viewed when active
    if (!currentStory.is_viewed) {
      api.viewStory(currentStory.id).catch(() => {});
    }

    if (currentStory.media_type === "image") {
      const timer = setTimeout(handleNext, 5000);
      return () => clearTimeout(timer);
    }
    // For video, we rely on the video onEnded event.
  }, [currentIndex, currentStory]);

  function handleNext() {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      router.push("/"); // close when last story finishes
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  if (loading || !currentStory) {
    return <div className="min-h-svh flex items-center justify-center bg-black"><span className="text-white text-sm">Loading...</span></div>;
  }

  return (
    <div className="relative min-h-svh max-w-md mx-auto w-full bg-black text-white overflow-hidden flex flex-col">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {currentStory.media_type === "video" ? (
          <video 
            src={currentStory.file_url} 
            autoPlay 
            playsInline 
            onEnded={handleNext}
            className="w-full h-full object-cover" 
          />
        ) : (
          <Image src={currentStory.file_url} alt="Story" fill className="object-cover" unoptimized />
        )}
      </div>

      {/* Overlay UI */}
      <div className="relative z-10 flex-1 flex flex-col justify-between pt-4 pb-8 px-4 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none">
        
        {/* Top Header */}
        <div className="flex flex-col gap-3 pointer-events-auto">
          {/* Progress Bars */}
          <div className="flex gap-1 w-full">
            {stories.map((s, i) => (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-white transition-all duration-[5000ms] ease-linear`}
                  style={{
                    width: i < currentIndex ? '100%' : (i === currentIndex && s.media_type === "image" ? '100%' : '0%'),
                    transition: i === currentIndex && s.media_type === "image" ? 'width 5000ms linear' : 'none'
                  }}
                />
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full overflow-hidden relative bg-border border border-white/20">
                <Image src={avatarUrl(currentStory.author)} alt={currentStory.author.username} fill className="object-cover" unoptimized />
              </div>
              <span className="font-semibold text-sm shadow-black drop-shadow-md">{currentStory.author.username}</span>
            </div>
            
            <button onClick={() => router.push("/")} className="p-1">
              <X size={24} className="drop-shadow-md" />
            </button>
          </div>
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <p className="text-sm font-medium drop-shadow-md pb-10 px-2 pointer-events-auto">{currentStory.caption}</p>
        )}
      </div>

      {/* Tap Zones for Next/Prev */}
      <div 
        className="absolute inset-y-20 left-0 w-1/3 z-20 cursor-pointer" 
        onClick={handlePrev} 
      />
      <div 
        className="absolute inset-y-20 right-0 w-2/3 z-20 cursor-pointer" 
        onClick={handleNext} 
      />
    </div>
  );
}
