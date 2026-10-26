"use client";

import { useEffect, useId, useState } from "react";
import { Check, Flag, X } from "lucide-react";
import { api, errorMessage, REPORT_REASONS, type ReportReason, type ReportTarget } from "@/lib/api";

const NOUNS: Record<ReportTarget, string> = {
  post: "post", comment: "comment", reel: "reel", reel_comment: "comment", user: "account",
};

/** Bottom sheet for reporting something to the Nepo team. `targetId` is the username for accounts. */
export default function ReportDialog({
  targetType,
  targetId,
  onClose,
}: {
  targetType: ReportTarget;
  targetId: string;
  onClose: () => void;
}) {
  const titleId = useId();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit() {
    if (!reason || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await api.report({ target_type: targetType, target_id: targetId, reason, details: details.trim() });
      setDone(res.detail);
    } catch (err) {
      setError(errorMessage(err, "Couldn't send the report. Please try again."));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-3xl p-5 pb-8 max-h-[90svh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 id={titleId} className="text-base font-extrabold flex items-center gap-2">
            <Flag size={16} /> Report {NOUNS[targetType]}
          </h2>
          <button onClick={onClose} aria-label="Close" className="h-8 w-8 rounded-full hover:bg-border flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <span className="h-12 w-12 rounded-full bg-brand flex items-center justify-center">
              <Check size={22} className="text-pill" />
            </span>
            <p className="text-sm">{done}</p>
            <p className="text-xs text-muted">You can also block this account from their profile.</p>
            <button onClick={onClose} className="mt-2 bg-brand text-pill font-semibold rounded-xl px-6 py-2.5 text-sm">
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-3">Why are you reporting this? Your report is anonymous.</p>
            <div role="radiogroup" className="flex flex-col gap-1.5">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.value}
                  role="radio"
                  aria-checked={reason === r.value}
                  onClick={() => setReason(r.value)}
                  className={`text-left text-sm rounded-xl border px-4 py-2.5 transition-colors ${
                    reason === r.value ? "border-brand bg-brand/10 font-semibold" : "border-border hover:bg-border/50"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Anything else we should know? (optional)"
              className="mt-3 w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand resize-none"
            />
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            <button
              onClick={submit}
              disabled={!reason || sending}
              className="mt-3 w-full bg-brand text-pill font-semibold rounded-xl py-3 text-sm disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send report"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
