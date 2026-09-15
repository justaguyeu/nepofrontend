/**
 * Auth session storage. Tokens live in localStorage (read by the fetch
 * client in api.ts) and a cookie (read by proxy.ts, which runs on the
 * server and can't see localStorage). The username is cached too, purely
 * so the UI (bottom nav, profile links) can render instantly instead of
 * waiting on a /users/me/ round trip on every page.
 */

const ACCESS_KEY = "nepo_access_token";
const REFRESH_KEY = "nepo_refresh_token";
const USERNAME_KEY = "nepo_username";

export function setSession(access: string, refresh: string, username?: string) {
  window.localStorage.setItem(ACCESS_KEY, access);
  window.localStorage.setItem(REFRESH_KEY, refresh);
  if (username) window.localStorage.setItem(USERNAME_KEY, username);
  // 7 days, matches SIMPLE_JWT access token lifetime on the backend
  document.cookie = `${ACCESS_KEY}=${access}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
}

export function setCachedUsername(username: string) {
  window.localStorage.setItem(USERNAME_KEY, username);
}

export function getCachedUsername(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USERNAME_KEY);
}

export function clearSession() {
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USERNAME_KEY);
  document.cookie = `${ACCESS_KEY}=; path=/; max-age=0`;
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.localStorage.getItem(ACCESS_KEY);
}
