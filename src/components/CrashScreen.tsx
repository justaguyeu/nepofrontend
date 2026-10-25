"use client";

import { useEffect, useSyncExternalStore } from "react";
import { logoutToLogin, onOpenPage } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import NepoLogo from "./NepoLogo";

const subscribeNever = () => () => {};

/**
 * Shown when a page crashes (app/error.tsx, app/global-error.tsx).
 *
 * Signed in on an app page: the person is signed out and sent to /login,
 * which explains what happened. On pages anyone can open (login, sign-up,
 * landing, terms) or when signed out, it offers "Try again" instead — sending
 * people to /login from there could loop if that page is the one crashing.
 */
export default function CrashScreen({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const signOut = useSyncExternalStore(subscribeNever, () => isLoggedIn() && !onOpenPage(), () => false);

  useEffect(() => {
    console.error(error);
    if (signOut) logoutToLogin("error");
  }, [error, signOut]);

  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <NepoLogo size={56} />
      <h1 className="text-xl font-extrabold">Something went wrong</h1>
      {signOut ? (
        <p className="max-w-xs text-sm text-muted">Signing you out so you can log in again…</p>
      ) : (
        <>
          <p className="max-w-xs text-sm text-muted">Sorry about that. Please try again.</p>
          <button
            onClick={() => retry()}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-pill"
          >
            Try again
          </button>
        </>
      )}
    </main>
  );
}
