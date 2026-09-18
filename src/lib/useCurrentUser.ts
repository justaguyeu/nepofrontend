"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import { setCachedUsername } from "./auth";
import type { UserProfile } from "./types";

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
