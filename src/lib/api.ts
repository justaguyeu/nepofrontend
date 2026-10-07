/**
 * Thin fetch wrapper around the Django REST API.
 * Set NEXT_PUBLIC_API_URL in .env.local to point at the backend
 * (defaults to http://localhost:8000/api).
 */
import type {
  BusinessCategory, BusinessProfile, Comment, Notification, Post, Reel, ReelComment, Story,
  UserProfile, UserSummary,
} from "./types";
import { clearSession, getAccessToken, getRefreshToken, setSession } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://nepobackend.onrender.com/api";

interface Paginated<T> {
  results: T[];
  next: string | null;
  previous: string | null;
}

/**
 * Thrown for any non-2xx response. `message` keeps the "API <status>: <body>"
 * shape; `data` is the parsed JSON body (DRF's field -> [messages] errors).
 */
export class ApiError extends Error {
  constructor(public status: number, public data: unknown, body: string) {
    super(`API ${status}: ${body}`);
  }
}

/** Turns any error from the API into one short, human-readable sentence. */
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!(err instanceof ApiError)) return err instanceof TypeError ? "Can't reach Nepo. Check your connection." : fallback;
  if (err.status === 429) return "Too many attempts. Please wait a minute and try again.";
  const data = err.data;
  if (data && typeof data === "object") {
    const messages = Object.values(data as Record<string, unknown>).flatMap((v) => (Array.isArray(v) ? v : [v]));
    const first = messages.find((m): m is string => typeof m === "string" && m.length > 0);
    if (first) return first;
  }
  return fallback;
}

/**
 * Access tokens live 30 minutes. When one expires, swap the refresh token
 * for a new pair. Concurrent 401s share a single refresh request (refresh
 * tokens are single-use, so two parallel refreshes would log the person out).
 * Resolves to the new access token, or null if the session is truly over.
 */
let refreshInFlight: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return Promise.resolve(null);
  refreshInFlight ??= fetch(`${API_BASE}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  })
    .then(async (res) => {
      if (!res.ok) return null;
      const data: { access: string; refresh?: string } = await res.json();
      setSession(data.access, data.refresh ?? refresh);
      return data.access;
    })
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

function endSession() {
  clearSession();
  const onAuthPage = ["/login", "/signup", "/terms"].some((p) => window.location.pathname.startsWith(p));
  // A full page load (not a client-side push) so no signed-in state survives in memory.
  if (!onAuthPage) window.location.replace(new URL("/login", window.location.origin).href);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...init } = options;
  const send = (token: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...(init.body && !(init.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });

  const token = skipAuth ? null : getAccessToken();
  let res = await send(token);
  if (res.status === 401 && token) {
    // Expired (or revoked) access token: try once more with a fresh one.
    const fresh = await refreshAccessToken();
    if (fresh) {
      res = await send(fresh);
    } else {
      endSession();
    }
  }
  if (!res.ok) {
    const body = await res.text();
    let data: unknown = null;
    try {
      data = JSON.parse(body);
    } catch {
      // not JSON (e.g. an HTML error page)
    }
    throw new ApiError(res.status, data, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Unwraps DRF's { results: [...] } pagination envelope into a plain array. */
async function apiList<T>(path: string): Promise<T[]> {
  const data = await apiFetch<Paginated<T> | T[]>(path);
  return Array.isArray(data) ? data : data.results;
}

export interface Page<T> {
  results: T[];
  /** Path (relative to API_BASE) of the next page, ready to pass back into the same call. */
  next: string | null;
}

/**
 * DRF returns `next` as an absolute URL built from the request it saw, which
 * can have the wrong scheme/host behind a proxy. Keep only the part after
 * API_BASE's path so the next request goes through API_BASE like any other.
 */
function toApiPath(nextUrl: string | null): string | null {
  if (!nextUrl) return null;
  const next = new URL(nextUrl);
  const basePath = new URL(API_BASE).pathname.replace(/\/$/, "");
  const path = next.pathname.startsWith(basePath) ? next.pathname.slice(basePath.length) : next.pathname;
  return path + next.search;
}

async function apiPage<T>(path: string): Promise<Page<T>> {
  const data = await apiFetch<Paginated<T> | T[]>(path);
  if (Array.isArray(data)) return { results: data, next: null };
  return { results: data.results, next: toApiPath(data.next) };
}

/** Follows `next` links until the list is exhausted (for comment threads). */
async function apiListAll<T>(path: string): Promise<T[]> {
  const all: T[] = [];
  let next: string | null = path;
  while (next) {
    const page: Page<T> = await apiPage<T>(next);
    all.push(...page.results);
    next = page.next;
  }
  return all;
}

export type FollowStatus = "accepted" | "pending" | "none";

export interface Message {
  id: string;
  sender: { username: string; avatar_url: string };
  text: string;
  media_url: string;
  created_at: string;
}

export const api = {
  login: (username: string, password: string) =>
    apiFetch<{ access: string; refresh: string }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      skipAuth: true,
    }),
  register: (payload: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
    is_business?: boolean;
    /** Must be true: the backend refuses registration without consent to the Terms. */
    accepted_terms: boolean;
  }) =>
    apiFetch<{ access: string; refresh: string; user: UserProfile }>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    }),
  me: () => apiFetch<UserProfile>("/users/me/"),
  updateMe: (payload: Partial<Pick<UserProfile, "bio" | "full_name" | "website" | "avatar_url" | "is_private" | "is_business">>) =>
    apiFetch<UserProfile>("/users/me/", { method: "PATCH", body: JSON.stringify(payload) }),
  changePassword: (payload: { old_password: string; new_password: string }) =>
    apiFetch<{ detail: string; access: string; refresh: string }>("/users/change_password/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  /** Revokes the refresh token server-side; local session is cleared by the caller. */
  logout: () => {
    const refresh = getRefreshToken();
    if (!refresh) return Promise.resolve();
    return apiFetch<void>("/auth/logout/", { method: "POST", body: JSON.stringify({ refresh }), skipAuth: true });
  },
  profile: (username: string) => apiFetch<UserProfile>(`/users/${username}/`),

  businessCategories: () => apiList<BusinessCategory>("/business-categories/"),
  /** Returns null (not an error) when this user has no business profile yet. */
  business: async (username: string): Promise<BusinessProfile | null> => {
    try {
      return await apiFetch<BusinessProfile>(`/businesses/${username}/`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },
  saveBusinessProfile: (
    username: string,
    exists: boolean,
    payload: {
      category_id?: number;
      contact_phone?: string;
      contact_email?: string;
      whatsapp_number?: string;
      address?: string;
      map_link?: string;
    }
  ) =>
    exists
      ? apiFetch<BusinessProfile>(`/businesses/${username}/`, { method: "PATCH", body: JSON.stringify(payload) })
      : apiFetch<BusinessProfile>("/businesses/", { method: "POST", body: JSON.stringify(payload) }),

  searchUsers: (query: string) =>
    apiList<UserProfile>(`/users/?search=${encodeURIComponent(query)}`),

  /** Paged lists: call with no argument for page one, then with the returned `next`. */
  feed: (next?: string) => apiPage<Post>(next ?? "/posts/feed/"),
  explore: (next?: string) => apiPage<Post>(next ?? "/posts/explore/"),
  post: (id: string) => apiFetch<Post>(`/posts/${id}/`),
  deletePost: (id: string) => apiFetch<void>(`/posts/${id}/`, { method: "DELETE" }),
  postsByUser: (username: string, next?: string) =>
    apiPage<Post>(next ?? `/posts/?username=${encodeURIComponent(username)}`),
  createPost: (payload: {
    caption?: string;
    location_name?: string;
    media_urls: string[];
    hashtag_names?: string[];
  }) => apiFetch<Post>("/posts/", { method: "POST", body: JSON.stringify(payload) }),
  likePost: (id: string) =>
    apiFetch<{ liked: boolean; like_count: number }>(`/posts/${id}/like/`, { method: "POST" }),
  savePost: (id: string) =>
    apiFetch<{ saved: boolean }>(`/posts/${id}/save/`, { method: "POST" }),
  comments: (postId: string) => apiListAll<Comment>(`/comments/?post=${postId}`),
  addComment: (postId: string, text: string, parent?: string) =>
    apiFetch<Comment>("/comments/", {
      method: "POST",
      body: JSON.stringify({ post: postId, text, parent }),
    }),
  likeComment: (id: string) =>
    apiFetch<{ liked: boolean; like_count: number }>(`/comments/${id}/like/`, { method: "POST" }),
  deleteComment: (id: string) => apiFetch<void>(`/comments/${id}/`, { method: "DELETE" }),

  storyFeed: () => apiFetch<Story[]>("/stories/feed/"),
  createStory: (payload: { media_type: "image" | "video"; file_url: string; caption?: string }) =>
    apiFetch<Story>("/stories/", { method: "POST", body: JSON.stringify(payload) }),
  viewStory: (id: string) => apiFetch(`/stories/${id}/view/`, { method: "POST" }),

  reelsDiscover: (next?: string) => apiPage<Reel>(next ?? "/reels/discover/"),
  reelsByUser: (username: string) => apiList<Reel>(`/reels/?username=${encodeURIComponent(username)}`),
  reel: (id: string) => apiFetch<Reel>(`/reels/${id}/`),
  createReel: (payload: { video_url: string; thumbnail_url?: string; caption?: string; audio_title?: string }) =>
    apiFetch<Reel>("/reels/", { method: "POST", body: JSON.stringify(payload) }),
  likeReel: (id: string) =>
    apiFetch<{ liked: boolean; like_count: number }>(`/reels/${id}/like/`, { method: "POST" }),
  viewReel: (id: string) => apiFetch(`/reels/${id}/view/`, { method: "POST" }),
  reelComments: (reelId: string) => apiListAll<ReelComment>(`/reel-comments/?reel=${reelId}`),
  addReelComment: (reelId: string, text: string) =>
    apiFetch<ReelComment>("/reel-comments/", {
      method: "POST",
      body: JSON.stringify({ reel: reelId, text }),
    }),
  deleteReelComment: (id: string) => apiFetch<void>(`/reel-comments/${id}/`, { method: "DELETE" }),

  /** Toggles: follows (or requests, for private accounts) or unfollows/cancels. */
  follow: (target_username: string) =>
    apiFetch<{ following: boolean; status: FollowStatus }>("/follow/", {
      method: "POST",
      body: JSON.stringify({ target_username }),
    }),
  followRequests: () =>
    apiFetch<{ id: string; follower: UserSummary; created_at: string }[]>("/follow/requests/"),
  acceptFollowRequest: (id: string) =>
    apiFetch(`/follow/requests/${id}/accept/`, { method: "POST" }),
  declineFollowRequest: (id: string) =>
    apiFetch(`/follow/requests/${id}/decline/`, { method: "POST" }),
  notifications: () => apiList<Notification>("/notifications/"),
  markNotificationsRead: () => apiFetch("/notifications/mark_read/", { method: "POST" }),
  /** Finds an existing 1:1 conversation with this user or creates a new one. */
  startConversation: async (username: string) => {
    const profile = await apiFetch<UserProfile>(`/users/${username}/`);
    const existing = await api.conversations();
    const match = existing.find(
      (c) => !c.is_group && c.participants.some((p) => p.username === username)
    );
    if (match) return match;
    return apiFetch<{
      id: string;
      participants: { id: string; username: string; avatar_url: string }[];
      is_group: boolean;
      group_name: string;
      group_avatar_url: string;
      last_message: { text: string; created_at: string; sender: { username: string } } | null;
    }>("/conversations/", {
      method: "POST",
      body: JSON.stringify({ participant_ids: [profile.id] }),
    });
  },
  conversations: () => apiList<{
    id: string;
    participants: { id: string; username: string; avatar_url: string }[];
    is_group: boolean;
    group_name: string;
    group_avatar_url: string;
    last_message: { text: string; created_at: string; sender: { username: string } } | null;
  }>("/conversations/"),
  conversation: (conversationId: string) =>
    apiFetch<{
      id: string;
      participants: { id: string; username: string; avatar_url: string }[];
      is_group: boolean;
      group_name: string;
    }>(`/conversations/${conversationId}/`),
  conversationMessages: (conversationId: string) =>
    apiFetch<Message[]>(`/conversations/${conversationId}/messages/`),
  sendMessage: (conversationId: string, text: string) =>
    apiFetch<Message>(`/conversations/${conversationId}/messages/`, {
      method: "POST",
      body: JSON.stringify({ kind: "text", text }),
    }),

  trendingHashtags: () =>
    apiFetch<{ id: number; name: string; post_count: number }[]>("/hashtags/trending/"),
  hashtagPosts: (name: string, next?: string) =>
    apiPage<Post>(next ?? `/hashtags/${encodeURIComponent(name)}/posts/`),

  uploadMedia: (file: File, folder = "posts") => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    return apiFetch<{ url: string; path: string }>("/uploads/", {
      method: "POST",
      body: form,
    });
  },
};
