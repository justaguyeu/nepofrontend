"use client";

import { useRef, useState } from "react";

/**
 * Optimistic like/unlike for posts, reels and comments. Flips immediately,
 * then settles on the server's answer (so the count can't drift), rolls
 * back on failure, and ignores taps while a request is still in flight so
 * a double-tap can't send two toggles that cancel each other out.
 */
export function useLikeToggle(
  initialLiked: boolean,
  initialCount: number,
  request: () => Promise<{ liked: boolean; like_count: number }>
) {
  const [state, setState] = useState({ liked: initialLiked, count: initialCount });
  const inFlight = useRef(false);

  function toggle() {
    if (inFlight.current) return;
    inFlight.current = true;
    const previous = state;
    setState({ liked: !previous.liked, count: Math.max(0, previous.count + (previous.liked ? -1 : 1)) });
    request()
      .then((res) => setState({ liked: res.liked, count: res.like_count }))
      .catch(() => setState(previous))
      .finally(() => {
        inFlight.current = false;
      });
  }

  return { liked: state.liked, count: state.count, toggle };
}
