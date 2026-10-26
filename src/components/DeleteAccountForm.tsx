"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { clearSession } from "@/lib/auth";

/**
 * Password-confirmed, permanent account deletion (Settings and /delete-account).
 * Calls `onDeleted` after the account is gone and this device is signed out.
 */
export default function DeleteAccountForm({ onDeleted }: { onDeleted: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed || !password || deleting) return;
    setDeleting(true);
    setError("");
    try {
      await api.deleteAccount(password);
      clearSession();
      onDeleted();
    } catch (err) {
      setError(errorMessage(err, "Couldn't delete your account. Please try again."));
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleDelete} className="flex flex-col gap-3">
      <p className="text-sm text-muted leading-relaxed">
        This permanently deletes your profile, posts, reels, stories, highlights, comments, likes, follows, saved
        posts, the messages you sent and the photos and videos you uploaded. It can&apos;t be undone.
      </p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password to confirm"
        autoComplete="current-password"
        className="bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
      />
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 accent-red-600"
        />
        I understand my account and everything in it will be deleted forever.
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        disabled={!confirmed || !password || deleting}
        className="bg-red-600 text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete my account permanently"}
      </button>
    </form>
  );
}
