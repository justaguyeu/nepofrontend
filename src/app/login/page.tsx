"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NepoLogo from "@/components/NepoLogo";
import { setSession } from "@/lib/auth";
import { api, ApiError, errorMessage, type LogoutReason } from "@/lib/api";

/** Why the person was sent here (see logoutToLogin in lib/api.ts). */
const REASONS: Record<LogoutReason, string> = {
  expired: "Your session has ended. Please log in again.",
  error: "Something went wrong, so we signed you out to keep your account safe. Please log in again.",
};

/** Only same-site paths, so a crafted link can't send people to another site after login. */
function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ reason?: string; next?: string }> }) {
  const { reason, next } = use(searchParams);
  const notice = reason && reason in REASONS ? REASONS[reason as LogoutReason] : null;
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { access, refresh } = await api.login(username, password);
      setSession(access, refresh);
      try {
        const me = await api.me();
        setSession(access, refresh, me.username);
      } catch {
        // non-fatal — username cache will fill in on first page that fetches it
      }
      router.push(safeNext(next));
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Wrong username or password."
          : errorMessage(err, "Couldn't sign in. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full min-h-svh">
      <div className="flex flex-col items-center mb-8 text-center">
        <NepoLogo size={56} className="mb-4" />
        <h1 className="text-2xl font-extrabold">Nepo</h1>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          The social platform for Tanzanian business people. Showcase your
          shop, meet customers, and follow the makers, traders, and
          creators building around you — all in one feed.
        </p>
      </div>

      {notice && (
        <p role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {notice}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoComplete="username"
          required
          className="bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          required
          className="bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          disabled={loading}
          className="bg-brand text-pill font-semibold rounded-xl py-3 text-sm mt-2 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Log in"}
        </button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        New to Nepo?{" "}
        <Link href="/signup" className="text-brand-dark font-semibold">
          Create an account
        </Link>
      </p>
      <p className="text-center text-sm mt-3">
        <Link href="/welcome" className="text-muted underline underline-offset-4 hover:text-foreground">
          What is Nepo? See how it works
        </Link>
      </p>
    </main>
  );
}
