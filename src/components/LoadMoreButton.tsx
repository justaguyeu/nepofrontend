"use client";

export default function LoadMoreButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <div className="flex justify-center py-4">
      <button
        onClick={onClick}
        disabled={loading}
        className="text-sm font-semibold text-brand-dark bg-surface border border-border rounded-full px-5 py-2 disabled:opacity-50"
      >
        {loading ? "Loading..." : "Load more"}
      </button>
    </div>
  );
}
