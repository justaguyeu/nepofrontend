import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LegalText from "@/components/LegalText";
import { PRIVACY_SECTIONS, PRIVACY_UPDATED } from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy · Nepo",
  description: "What information Nepo collects, how it is used, who can see it, and how to delete your account.",
};

export default function PrivacyPage() {
  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-5 pb-16">
      <div className="flex items-center gap-3 pt-5 pb-4 sticky top-0 bg-background z-10">
        <Link
          href="/"
          aria-label="Back to Nepo"
          className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-lg font-extrabold">Privacy Policy</h1>
      </div>
      <LegalText updated={PRIVACY_UPDATED} sections={PRIVACY_SECTIONS} />
      <p className="mt-8 text-sm text-muted">
        See also our <Link href="/terms" className="text-brand-dark font-semibold">Terms &amp; Conditions</Link> and{" "}
        <Link href="/delete-account" className="text-brand-dark font-semibold">how to delete your account</Link>.
      </p>
    </main>
  );
}
