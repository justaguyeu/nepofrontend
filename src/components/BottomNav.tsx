"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Clapperboard, Send, CircleUserRound } from "lucide-react";
import { getCachedUsername } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(getCachedUsername());
  }, [pathname]);

  const profileHref = username ? `/profile/${username}` : "/settings";

  const navItems = [
    { href: "/", label: "Home", icon: Home, center: false },
    { href: "/explore", label: "Explore", icon: Compass, center: false },
    { href: "/reels", label: "Reels", icon: Clapperboard, center: true },
    { href: "/messages", label: "Messages", icon: Send, center: false },
    { href: profileHref, label: "Profile", icon: CircleUserRound, center: false },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(95vw,380px)]">
      <ul className="nav-pill rounded-full flex items-center justify-between px-3 py-2">
        {navItems.map(({ href, label, icon: Icon, center }) => {
          const active =
            (label === "Home" && pathname === "/") ||
            (label === "Explore" && pathname.startsWith("/explore")) ||
            (label === "Reels" && (pathname === "/reels" || pathname.startsWith("/reels/"))) ||
            (label === "Messages" && pathname.startsWith("/messages")) ||
            (label === "Profile" && pathname.startsWith("/profile/"));

          if (center) {
            return (
              <li key={label} className="flex items-center justify-center px-1">
                <Link
                  href={href}
                  aria-label={label}
                  className={`flex items-center justify-center h-12 w-12 rounded-full transition-all duration-200 shadow-lg ${
                    active
                      ? "bg-brand text-pill scale-110 shadow-brand/30"
                      : "bg-brand text-pill hover:scale-105 hover:shadow-brand/50"
                  }`}
                >
                  <Icon size={22} strokeWidth={2.2} />
                </Link>
              </li>
            );
          }

          return (
            <li key={label} className="flex-1 flex items-center justify-center">
              <Link
                href={href}
                aria-label={label}
                className={`flex items-center justify-center h-11 w-11 rounded-full transition-all duration-200 ${
                  active
                    ? "bg-white/12 text-white"
                    : "text-white/55 hover:text-white/85 hover:bg-white/5"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
