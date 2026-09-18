/**
 * Thin fetch wrapper around the Django REST API.
 * Set NEXT_PUBLIC_API_URL in .env.local to point at the backend
 * (defaults to http://localhost:8000/api).
 */
import type {
  BusinessCategory, BusinessProfile, Comment, Post, Reel, Story, UserProfile, UserSummary,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://nepobackend.onrender.com/api";

interface Paginated<T> {
  results: T[];
  next: string | null;
  previous: string | null;
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("nepo_access_token");
}

function clearStaleSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("nepo_access_token");
  window.localStorage.removeItem("nepo_refresh_token");
  window.localStorage.removeItem("nepo_username");
  document.cookie = "nepo_access_token=; path=/; max-age=0";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...init } = options;
  const token = skipAuth ? null : getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    // A 401 on an authenticated request almost always means our stored
    // token is stale/invalid (expired, or signed with an old SECRET_KEY
    // after a backend restart) -- drop it so we stop resending it.
    if (res.status === 401 && !skipAuth && token) {
      clearStaleSession();
    }
    const detail = await res.text();
    throw new Error(`API ${res.status}: ${detail}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Unwraps DRF's { results: [...] } pagination envelope into a plain array. */
async function apiList<T>(path: string): Promise<T[]> {
  const data = await apiFetch<Paginated<T> | T[]>(path);
  return Array.isArray(data) ? data : data.results;
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
    apiFetch<{ detail: string }>("/users/change_password/", { method: "POST", body: JSON.stringify(payload) }),
  profile: (username: string) => apiFetch<UserProfile>(`/users/${username}/`),

  businessCategories: () => apiList<BusinessCategory>("/business-categories/"),
  /** Returns null (not an error) when this user has no business profile yet. */
  business: async (username: string): Promise<BusinessProfile | null> => {
    try {
      return await apiFetch<BusinessProfile>(`/businesses/${username}/`);
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("API 404")) return null;
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

  feed: () => apiList<Post>("/posts/feed/"),
  explore: () => apiList<Post>("/posts/explore/"),
  post: (id: string) => apiFetch<Post>(`/posts/${id}/`),
  postsByUser: (username: string) => apiList<Post>(`/posts/?username=${encodeURIComponent(username)}`),
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
  comments: (postId: string) => apiList<Comment>(`/comments/?post=${postId}`),
  addComment: (postId: string, text: string, parent?: string) =>
    apiFetch<Comment>("/comments/", {
      method: "POST",
      body: JSON.stringify({ post: postId, text, parent }),
    }),

  storyFeed: () => apiFetch<Story[]>("/stories/feed/"),
  createStory: (payload: { media_type: "image" | "video"; file_url: string; caption?: string }) =>
    apiFetch<Story>("/stories/", { method: "POST", body: JSON.stringify(payload) }),
  viewStory: (id: string) => apiFetch(`/stories/${id}/view/`, { method: "POST" }),

  reelsDiscover: () => apiList<Reel>("/reels/discover/"),
  reelsByUser: (username: string) => apiList<Reel>(`/reels/?username=${encodeURIComponent(username)}`),
  reel: (id: string) => apiFetch<Reel>(`/reels/${id}/`),
  createReel: (payload: { video_url: string; thumbnail_url?: string; caption?: string; audio_title?: string }) =>
    apiFetch<Reel>("/reels/", { method: "POST", body: JSON.stringify(payload) }),
  likeReel: (id: string) =>
    apiFetch<{ liked: boolean; like_count: number }>(`/reels/${id}/like/`, { method: "POST" }),
  viewReel: (id: string) => apiFetch(`/reels/${id}/view/`, { method: "POST" }),
  reelComments: (reelId: string) =>
    apiList<{ id: string; reel: string; author: UserSummary; text: string; created_at: string }>(
      `/reel-comments/?reel=${reelId}`
    ),
  addReelComment: (reelId: string, text: string) =>
    apiFetch<{ id: string; reel: string; author: UserSummary; text: string; created_at: string }>(
      "/reel-comments/",
      { method: "POST", body: JSON.stringify({ reel: reelId, text }) }
    ),

  follow: (target_username: string) =>
    apiFetch<{ following?: boolean; status?: string }>("/follow/", {
      method: "POST",
      body: JSON.stringify({ target_username }),
    }),
  notifications: () => apiList<{
    id: string;
    actor: { id: string; username: string; full_name: string; avatar_url: string; is_verified: boolean };
    notification_type: string;
    is_read: boolean;
    created_at: string;
  }>("/notifications/"),
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
  conversationMessages: (conversationId: string) =>
    apiFetch<{
      id: string;
      sender: { username: string; avatar_url: string };
      text: string;
      media_url: string;
      created_at: string;
    }[]>(`/conversations/${conversationId}/messages/`),
  sendMessage: (conversationId: string, text: string) =>
    apiFetch(`/conversations/${conversationId}/messages/`, {
      method: "POST",
      body: JSON.stringify({ kind: "text", text }),
    }),

  trendingHashtags: () =>
    apiFetch<{ id: number; name: string; post_count: number }[]>("/hashtags/trending/"),
  hashtagPosts: (name: string) => apiList<Post>(`/hashtags/${encodeURIComponent(name)}/posts/`),

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
