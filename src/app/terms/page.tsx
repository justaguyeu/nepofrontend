import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TermsContent from "@/components/TermsContent";

export const metadata: Metadata = {
  title: "Terms & Conditions · Nepo",
  description: "The terms that apply when you create a Nepo account and use the Nepo web app.",
};

export default function TermsPage() {
  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-5 pb-16">
      <div className="flex items-center gap-3 pt-5 pb-4 sticky top-0 bg-background z-10">
        <Link
          href="/signup"
          aria-label="Back to sign up"
          className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-lg font-extrabold">Terms &amp; Conditions</h1>
      </div>
      <TermsContent />
    </main>
  );
}
