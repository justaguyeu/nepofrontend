"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import { clearSession } from "@/lib/auth";

export default function SettingsPage() {
  const router = useRouter();

  function handleLogout() {
    clearSession();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="flex-1 max-w-md mx-auto w-full">
      <div className="flex items-center gap-3 px-4 pt-5 pb-2">
        <Link href="/" className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-base font-bold">Settings</h1>
      </div>

      <div className="px-4 mt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-surface border border-border text-red-500 font-semibold rounded-xl py-3 text-sm"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </main>
  );
}
