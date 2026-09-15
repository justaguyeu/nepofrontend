"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { setCachedUsername } from "./auth";
import type { UserProfile } from "./types";

export function useCurrentUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
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

  useEffect(() => {
    const cancel = fetchUser();
    return cancel;
  }, [fetchUser]);

  // mutate(updated) -> set user directly, no refetch (e.g. after a successful save)
  // mutate()        -> refetch the user from the server
  const mutate = useCallback(
    (updated?: UserProfile) => {
      if (updated) {
        setUser(updated);
        setCachedUsername(updated.username);
      } else {
        fetchUser();
      }
    },
    [fetchUser]
  );

  return { user, loading, error, mutate };
}