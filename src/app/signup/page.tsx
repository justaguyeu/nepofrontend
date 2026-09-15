"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Briefcase, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { setSession } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
  });
  const [isBusiness, setIsBusiness] = useState(false);
  const [businessError, setBusinessError] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Enforce: must check business account box
    if (!isBusiness) {
      setBusinessError(true);
      return;
    }
    setBusinessError(false);
    setLoading(true);
    setError("");
    try {
      const { access, refresh, user } = await api.register({
        ...form,
        is_business: isBusiness,
      });
      setSession(access, refresh, user?.username ?? form.username);
      router.push("/");
      router.refresh();
    } catch {
      setError(
        "Couldn't create your account. That username or email may already be taken."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full min-h-svh py-10">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8 text-center">
        <span className="h-16 w-16 rounded-2xl bg-brand flex items-center justify-center mb-4 shadow-md">
          <Plus size={28} strokeWidth={3} className="text-pill" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight">Join Nepo</h1>
        <p className="text-sm text-muted mt-2 leading-relaxed max-w-xs">
          Nepo is a business-first social platform. Every account represents a
          business, brand, or creator.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          placeholder="Full name / Business name"
          autoComplete="name"
          required
          className="bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors"
        />
        <input
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })
          }
          placeholder="Username"
          autoComplete="username"
          required
          className="bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors"
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          autoComplete="email"
          required
          className="bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors"
        />
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password (min. 8 characters)"
          autoComplete="new-password"
          required
          minLength={8}
          className="bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors"
        />

        {/* Business account checkbox — REQUIRED */}
        <button
          type="button"
          onClick={() => {
            setIsBusiness((b) => !b);
            setBusinessError(false);
          }}
          className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all mt-1 ${
            isBusiness
              ? "border-brand bg-brand/10"
              : businessError
              ? "border-red-400 bg-red-50"
              : "border-border bg-surface"
          }`}
        >
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
              isBusiness ? "bg-brand" : "bg-border"
            }`}
          >
            {isBusiness ? (
              <CheckCircle2 size={20} className="text-pill" />
            ) : (
              <Briefcase size={18} className="text-muted" />
            )}
          </div>
          <div className="text-left">
            <p className={`text-sm font-bold ${isBusiness ? "text-brand-dark" : "text-foreground"}`}>
              Business Account ✓
            </p>
            <p className="text-xs text-muted leading-snug mt-0.5">
              All Nepo accounts must be registered as a business account
            </p>
          </div>
        </button>

        {businessError && (
          <p className="text-xs text-red-500 font-medium -mt-1 px-1">
            ⚠ You must check the Business Account box to register on Nepo.
          </p>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-brand text-pill font-bold rounded-xl py-3.5 text-sm mt-2 disabled:opacity-60 transition-opacity shadow"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-dark font-bold">
          Log in
        </Link>
      </p>
    </main>
  );
}
