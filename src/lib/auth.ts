/**
 * Auth session storage. Tokens live in localStorage (read by the fetch
 * client in api.ts). proxy.ts runs on the server and can't see
 * localStorage, so a separate cookie tells it whether someone is signed in;
 * that cookie is only a marker and never holds a token. The username is
 * cached too, purely so the UI (bottom nav, profile links) can render
 * instantly instead of waiting on a /users/me/ round trip on every page.
 */

const ACCESS_KEY = "nepo_access_token";
const REFRESH_KEY = "nepo_refresh_token";
const USERNAME_KEY = "nepo_username";
/** Read by proxy.ts. Keep the name in sync there. */
export const SESSION_COOKIE = "nepo_session";
/** Matches SIMPLE_JWT REFRESH_TOKEN_LIFETIME on the backend (30 days). */
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
/** Fired on same-tab session changes (the "storage" event only fires in other tabs). */
export const SESSION_EVENT = "nepo-session";

function notifySessionChange() {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

function writeCookie(value: string, maxAge: number) {
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${SESSION_COOKIE}=${value}; path=/; max-age=${maxAge}; samesite=lax${secure}`;
}

export function setSession(access: string, refresh: string, username?: string) {
  window.localStorage.setItem(ACCESS_KEY, access);
  window.localStorage.setItem(REFRESH_KEY, refresh);
  if (username) window.localStorage.setItem(USERNAME_KEY, username);
  writeCookie("1", SESSION_MAX_AGE);
  notifySessionChange();
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setCachedUsername(username: string) {
  if (window.localStorage.getItem(USERNAME_KEY) === username) return;
  window.localStorage.setItem(USERNAME_KEY, username);
  notifySessionChange();
}

export function getCachedUsername(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USERNAME_KEY);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USERNAME_KEY);
  writeCookie("", 0);
  // Older builds stored the access token itself in a cookie; remove it too.
  document.cookie = `${ACCESS_KEY}=; path=/; max-age=0`;
  notifySessionChange();
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.localStorage.getItem(ACCESS_KEY);
}
