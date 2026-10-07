"use client";

import { useEffect, useState } from "react";
import type { Page } from "./api";

/**
 * Loads page one of a paged endpoint on mount (and whenever `deps` change),
 * and exposes `loadMore` for the following pages. `fetchPage(undefined)`
 * must return page one; `fetchPage(next)` the page after it.
 */
export function usePagedList<T extends { id: string }>(
  fetchPage: (next?: string) => Promise<Page<T>>,
  deps: unknown[] = []
) {
  const [items, setItems] = useState<T[] | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPage()
      .then((page) => {
        if (cancelled) return;
        setItems(page.results);
        setNext(page.next);
        setError(false);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  async function loadMore() {
    if (!next || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchPage(next);
      setItems((current) => {
        // Ranked pages can shift between requests; never show the same item twice.
        const seen = new Set((current ?? []).map((item) => item.id));
        return [...(current ?? []), ...page.results.filter((item) => !seen.has(item.id))];
      });
      setNext(page.next);
    } catch {
      // keep `next` so the person can retry
    } finally {
      setLoadingMore(false);
    }
  }

  function remove(id: string) {
    setItems((current) => current && current.filter((item) => item.id !== id));
  }

  return { items, hasMore: next !== null, loadMore, loadingMore, error, remove };
}
