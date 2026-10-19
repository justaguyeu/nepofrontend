/**
 * Nepo's mark: a bold rounded "N" on a lime tile. The N is one stroke (up,
 * diagonal, up) with the same geometry as the mobile app's NMarkPainter and
 * the app icons (src/app/icon.svg) — keep them in sync.
 */
export default function NepoLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Nepo"
      className={`shrink-0 rounded-[30%] ${className}`}
    >
      <rect width="100" height="100" rx="30" fill="var(--brand)" />
      <path
        d="M32 70V30L68 70V30"
        fill="none"
        stroke="var(--pill)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
