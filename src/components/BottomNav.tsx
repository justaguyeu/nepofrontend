"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusSquare, Clapperboard, Search, CircleUserRound } from "lucide-react";
import { getCachedUsername } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(getCachedUsername());
  }, [pathname]);

  const profileHref = username ? `/profile/${username}` : "/settings";

  const items = [
    { href: "/", label: "Home", icon: Home },
    // { href: "/explore", label: "Explore", icon: Compass },
    { href: "/create", label: "Create", icon: PlusSquare },
    { href: "/reels", label: "Reels", icon: Clapperboard },
    { href: profileHref, label: "Profile", icon: CircleUserRound },
    // { href: "/explore?search=1", label: "Search", icon: Search },
  ];

  // Show only first 5 – search lives at right of pill in the reference design
  const mainItems = items.slice(0, 5);

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(95vw,430px)] flex items-center gap-2">
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
                className={`flex items-center justify-center h-10 w-10 rounded-full transition-all ${
                  active ? "bg-brand text-pill" : "text-white/60 hover:text-white"
                }`}
              >
                <Icon size={19} strokeWidth={active ? 2.5 : 2} />
              </Link>
            </li>
          );
        })}
      </ul>
      {/* standalone search button */}
      <Link
        href="/explore"
        aria-label="Search"
        className="h-[52px] w-[52px] rounded-full nav-pill flex items-center justify-center text-white/70 hover:text-white transition-colors"
      >
        <Search size={20} strokeWidth={2} />
      </Link>
    </nav>
  );
}
