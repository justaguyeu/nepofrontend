"use client";

import { use, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import DeleteAccountForm from "@/components/DeleteAccountForm";
import NepoLogo from "@/components/NepoLogo";
import { isLoggedIn, SESSION_EVENT } from "@/lib/auth";
import { SUPPORT_EMAIL } from "@/lib/privacy";

function subscribe(onChange: () => void) {
  window.addEventListener(SESSION_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SESSION_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * The public "delete your account" page (the URL Google Play asks for).
 * Works without the app: signed in, you can delete right here; signed out,
 * it explains the steps and sends you to log in first.
 */
export default function DeleteAccountPage({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  const { done } = use(searchParams);
  const signedIn = useSyncExternalStore(subscribe, isLoggedIn, () => false);
  // ?done=1: the account was just deleted from Settings.
  const [deleted, setDeleted] = useState(done === "1");

  return (
    <main className="flex-1 max-w-md mx-auto w-full px-5 pb-16">
      <div className="flex items-center gap-3 pt-5 pb-4">
        <Link href="/" aria-label="Back to Nepo" className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-lg font-extrabold">Delete your Nepo account</h1>
      </div>

      {deleted ? (
        <div role="status" className="flex flex-col items-center text-center gap-3 py-12">
          <span className="h-12 w-12 rounded-full bg-brand flex items-center justify-center">
            <Check size={22} className="text-pill" />
          </span>
          <p className="font-semibold">Your account has been deleted.</p>
          <p className="text-sm text-muted">Thank you for being part of Nepo. You can create a new account any time.</p>
          <Link href="/welcome" className="mt-2 bg-brand text-pill font-semibold rounded-xl px-6 py-2.5 text-sm">
            Back to Nepo
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6 text-sm leading-relaxed">
          <div className="flex items-center gap-3">
            <NepoLogo size={40} />
            <p className="text-muted">
              You can delete your Nepo account and its data at any time, from the app or from this page.
            </p>
          </div>

          <section className="flex flex-col gap-2">
            <h2 className="font-bold">In the Nepo app</h2>
            <ol className="list-decimal pl-5 flex flex-col gap-1">
              <li>Open your profile and tap the settings (gear) icon.</li>
              <li>Scroll down and tap <strong>Delete account</strong>.</li>
              <li>Enter your password and confirm.</li>
            </ol>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-bold">What gets deleted</h2>
            <p>
              Deletion is immediate and permanent: your profile and business details, posts, reels, stories,
              highlights, comments, likes, follows, saved posts, the messages you sent, and the photos and videos you
              uploaded. Copies in encrypted backups are overwritten within 30 days. Reports about content that broke
              our rules are kept as a safety record, without your name if you made them.
            </p>
          </section>

          <section className="flex flex-col gap-3 bg-surface border border-border rounded-2xl p-4">
            <h2 className="font-bold">Delete it here</h2>
            {signedIn ? (
              <DeleteAccountForm onDeleted={() => setDeleted(true)} />
            ) : (
              <>
                <p className="text-muted">Log in to the account you want to delete, then you&apos;ll come straight back here.</p>
                <Link
                  href="/login?next=/delete-account"
                  className="bg-brand text-pill font-semibold rounded-xl py-3 text-sm text-center"
                >
                  Log in to delete your account
                </Link>
              </>
            )}
          </section>

          <p className="text-muted">
            {SUPPORT_EMAIL && (
              <>Can&apos;t log in? Email {SUPPORT_EMAIL} from the address on your account and we&apos;ll delete it for you.{" "}</>
            )}
            See our <Link href="/privacy" className="text-brand-dark font-semibold">Privacy Policy</Link>.
          </p>
        </div>
      )}
    </main>
  );
}
