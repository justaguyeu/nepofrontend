# Nepo — frontend

Next.js 16 (App Router, Turbopack) client for Nepo, a business-first social
platform for Tanzanian entrepreneurs and creators — feed, stories, reels,
explore, trending hashtags, DMs, and business profiles.

## Setup

```bash
npm install
cp .env.example .env.local     # then fill in real values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Signed out, you'll see
the landing page (`src/app/welcome`); log in or create an account (see the backend's
`seed_data` command for ready-made demo accounts — any seeded username with
password `password123`).

The frontend expects the Nepo backend to be running at the URL set in
`NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000/api`).

## Environment variables

See `.env.example`. `NEXT_PUBLIC_SUPABASE_*` values are used for direct
media uploads (avatars, post/reel/story files) — required for creating
posts, reels, or stories with real media.

## Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build (type-checks with tsc)
npm run start   # run a production build
npm run lint    # eslint
```

## Structure

```
src/app/            routes (App Router) — welcome (landing page), home, explore,
                    reels, trending, profile/[username], post/[id], reel/[id],
                    messages, notifications, create, settings, login, signup
src/components/     shared UI (PostCard, ReelCard, ProfileHeader, NepoLogo, etc.)
src/lib/api.ts      typed fetch wrapper around the Django REST API
src/lib/auth.ts     session storage (localStorage + cookie for the proxy)
src/proxy.ts        Next 16 middleware — shows signed-out visitors the landing
                    page at /, sends them to /login elsewhere, and redirects
                    signed-in visitors away from /login,/signup
```

## Notes for production

- This app calls the backend directly from the browser
  (`NEXT_PUBLIC_API_URL`) — make sure that URL is reachable and that the
  backend's `CORS_ALLOWED_ORIGINS` includes this app's deployed origin.
- Media uploads go straight to Supabase Storage; the Supabase project must
  have the bucket named in `NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET` created with
  appropriate public-read policies.
- `next build` type-checks the whole project — run it before deploying.
