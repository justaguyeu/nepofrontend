"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Clapperboard, Search, CircleUserRound } from "lucide-react";
import { getCachedUsername } from "@/lib/auth";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function BottomNav() {
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(getCachedUsername());
  }, [pathname]);

  const profileHref = username ? `/profile/${username}` : "/settings";

  const mainItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/trending", label: "Trending", icon: LineChart },
    { href: "/reels", label: "Reels", icon: Clapperboard },
    { href: profileHref, label: "Profile", icon: CircleUserRound },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(95vw,400px)] flex items-center gap-2 px-2">
      {/* pill nav */}
      <ul className="flex-1 flex items-center justify-between nav-pill rounded-full px-3 py-2">
        {mainItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (label === "Profile" && pathname.startsWith("/profile/")) ||
            (label === "Reels" && pathname.startsWith("/reels"));
          return (
            <li key={label}>
              <Link
                href={href}
                aria-label={label}
                className={`flex items-center justify-center h-11 w-11 rounded-full transition-all ${
                  active ? "bg-brand text-pill" : "text-white/70 hover:text-white"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </Link>
            </li>
          );
        })}
      </ul>
      {/* standalone search button */}
      <Link
        href="/explore"
        aria-label="Search"
        className="h-[60px] w-[60px] rounded-full nav-pill flex items-center justify-center text-white/80 hover:text-white transition-colors shadow-lg"
      >
        <Search size={22} strokeWidth={2} />
      </Link>
    </nav>
  );
}
