/** Returns a stable generated avatar when the user hasn't uploaded one yet. */
export function avatarUrl(user: { avatar_url?: string; username: string }): string {
  if (user.avatar_url) return user.avatar_url;
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(user.username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `${n}`;
}

/**
 * Shares a link to an in-app path with the native share sheet, falling
 * back to copying it. Resolves to a short message to show the person, or
 * null if they dismissed the share sheet.
 */
export async function shareLink(path: string, title: string): Promise<string | null> {
  const url = `${window.location.origin}${path}`;
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return null;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return null;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "Link copied";
  } catch {
    return "Couldn't share this link";
  }
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600e3);
  if (hrs < 1) {
    const mins = Math.max(1, Math.floor(diff / 60e3));
    return `${mins}m ago`;
  }
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
