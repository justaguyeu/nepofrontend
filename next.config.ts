import type { NextConfig } from "next";

const securityHeaders = [
  // Nobody may embed Nepo in a frame (stops clickjacking, e.g. a hidden "Follow" button).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Browsers must not guess content types (an uploaded file can't be "sniffed" into HTML).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full page URLs (post/conversation ids) to other sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Camera/mic/location aren't used; deny them outright.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/media/**" },
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/**" },
      { protocol: "https", hostname: "api.dicebear.com", pathname: "/**" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
