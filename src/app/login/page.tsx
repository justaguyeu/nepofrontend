"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { setSession } from "@/lib/auth";
import { api } from "@/lib/api";

export default function LoginPage() {
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
      router.push("/");
      router.refresh();
    } catch {
      setError("Couldn't sign in. Check your username and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full min-h-svh">
      <div className="flex flex-col items-center mb-8 text-center">
        <span className="h-14 w-14 rounded-2xl bg-brand flex items-center justify-center mb-4">
          <Plus size={26} strokeWidth={3} className="text-pill" />
        </span>
        <h1 className="text-2xl font-extrabold">Nepo</h1>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          The social platform for Tanzanian business people. Showcase your
          shop, meet customers, and follow the makers, traders, and
          creators building around you — all in one feed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoComplete="username"
          className="bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
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
    </main>
  );
}
