"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Briefcase, CheckCircle2, ExternalLink } from "lucide-react";
import { api, ApiError, errorMessage } from "@/lib/api";
import { setSession } from "@/lib/auth";
import TermsContent from "@/components/TermsContent";

type Field = "username" | "email" | "password" | "full_name" | "accepted_terms";

/** First message per field from a DRF 400 response, e.g. {"username": ["That username is taken."]}. */
function fieldErrors(err: unknown): Partial<Record<Field, string>> {
  if (!(err instanceof ApiError) || err.status !== 400 || !err.data || typeof err.data !== "object") return {};
  const out: Partial<Record<Field, string>> = {};
  for (const [key, value] of Object.entries(err.data as Record<string, unknown>)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === "string") out[key as Field] = first;
  }
  return out;
}

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
  const [readTerms, setReadTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);

  // The agree box unlocks once the person has scrolled to the end of the Terms.
  // (Also covers screens tall enough to show the whole text without scrolling.)
  useEffect(() => {
    const el = termsRef.current;
    if (!el) return;
    const check = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 16) setReadTerms(true);
    };
    const observer = new ResizeObserver(check);
    observer.observe(el);
    el.addEventListener("scroll", check, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", check);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Enforce: must check business account box
    if (!isBusiness) {
      setBusinessError(true);
      return;
    }
    if (!acceptedTerms) {
      setTermsError(true);
      return;
    }
    setBusinessError(false);
    setTermsError(false);
    setLoading(true);
    setError("");
    setErrors({});
    try {
      const { access, refresh, user } = await api.register({
        ...form,
        is_business: isBusiness,
        accepted_terms: acceptedTerms,
      });
      setSession(access, refresh, user?.username ?? form.username);
      router.push("/");
      router.refresh();
    } catch (err) {
      const byField = fieldErrors(err);
      setErrors(byField);
      setError(Object.keys(byField).length ? "" : errorMessage(err, "Couldn't create your account. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors";
  const fieldError = (field: Field) =>
    errors[field] && <p className="text-xs text-red-500 -mt-1.5 px-1">{errors[field]}</p>;

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
          maxLength={150}
          className={inputClass}
        />
        {fieldError("full_name")}
        <input
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "") })
          }
          placeholder="Username"
          autoComplete="username"
          required
          maxLength={150}
          className={inputClass}
        />
        {fieldError("username")}
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          autoComplete="email"
          required
          className={inputClass}
        />
        {fieldError("email")}
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password (min. 8 characters)"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
        {errors.password ? (
          fieldError("password")
        ) : (
          <p className="text-[11px] text-muted -mt-1.5 px-1">
            Use 8+ characters. Avoid common passwords or ones similar to your username.
          </p>
        )}

        {/* Business account checkbox — REQUIRED */}
        <button
          type="button"
          onClick={() => {
            setIsBusiness((b) => !b);
            setBusinessError(false);
          }}
          aria-pressed={isBusiness}
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

        {/* Terms & Conditions — must be read (scrolled to the end) and accepted */}
        <div className={`rounded-2xl border-2 mt-1 overflow-hidden ${termsError ? "border-red-400" : "border-border"}`}>
          <div className="flex items-center justify-between px-4 pt-3 pb-2 bg-surface">
            <p className="text-sm font-bold">Terms &amp; Conditions</p>
            <Link
              href="/terms"
              target="_blank"
              className="flex items-center gap-1 text-xs font-semibold text-brand-dark"
            >
              Full page <ExternalLink size={11} />
            </Link>
          </div>
          <div
            ref={termsRef}
            tabIndex={0}
            role="region"
            aria-label="Terms and Conditions"
            className="max-h-64 overflow-y-auto px-4 py-3 bg-background border-y border-border"
          >
            <TermsContent />
          </div>
          <label
            className={`flex items-start gap-3 px-4 py-3 bg-surface ${readTerms ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
          >
            <input
              type="checkbox"
              checked={acceptedTerms}
              disabled={!readTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                setTermsError(false);
              }}
              className="mt-0.5 h-4 w-4 accent-brand shrink-0"
            />
            <span className="text-xs leading-snug">
              {readTerms
                ? "I have read and agree to the Nepo Terms & Conditions."
                : "Scroll to the end of the Terms & Conditions to continue."}
            </span>
          </label>
        </div>

        {(termsError || errors.accepted_terms) && (
          <p className="text-xs text-red-500 font-medium -mt-1 px-1">
            ⚠ {errors.accepted_terms ?? "You must read and accept the Terms & Conditions to register."}
          </p>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || !acceptedTerms}
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
