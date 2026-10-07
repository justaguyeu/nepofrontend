"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { api } from "./api";
import { getCachedUsername, SESSION_EVENT, setCachedUsername } from "./auth";
import type { UserProfile } from "./types";

function subscribeToSession(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SESSION_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SESSION_EVENT, onChange);
  };
}

/**
 * The signed-in username from localStorage, without a network round trip.
 * null during server rendering and the first client render, so markup
 * always hydrates cleanly.
 */
export function useCachedUsername(): string | null {
  return useSyncExternalStore(subscribeToSession, getCachedUsername, () => null);
}

export function useCurrentUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then((profile) => {
        if (cancelled) return;
        setUser(profile);
        setCachedUsername(profile.username);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your profile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Lets callers optimistically update the cached profile after a PATCH. */
  function mutate(profile: UserProfile) {
    setUser(profile);
    setCachedUsername(profile.username);
  }

  return { user, loading, error, mutate };
}
