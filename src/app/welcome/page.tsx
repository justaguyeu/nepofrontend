import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Camera,
  Check,
  Clapperboard,
  Compass,
  Heart,
  Images,
  Lock,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
  Store,
  UserPlus,
} from "lucide-react";
import NepoWordmark from "@/components/NepoWordmark";

// Photos: Ali Mkumbwa (Dar es Salaam) and Iwaria on Unsplash — see images/CREDITS.md.
import heroFruitSeller from "./images/hero-fruit-seller.webp";
import carpenterCelebrating from "./images/carpenter-celebrating.webp";
import teamLaptop from "./images/team-laptop.webp";
import tailor from "./images/tailor.webp";
import shopOwner from "./images/shop-owner.webp";
import juiceBar from "./images/juice-bar.webp";
import fruitVendor from "./images/fruit-vendor.webp";
import carpenterWorkshop from "./images/carpenter-workshop.webp";
import streetFood from "./images/street-food.webp";

export const metadata: Metadata = {
  title: "Nepo — where Tanzanian businesses get seen",
  description:
    "Nepo is the social platform for Tanzanian businesses, makers and creators. Post your products, share reels and stories, chat with customers and grow your following — free.",
};

const businessKinds: { img: StaticImageData; label: string; sw: string; alt: string }[] = [
  { img: shopOwner, label: "Shops", sw: "Maduka", alt: "A shop owner in Dar es Salaam smiling as she takes a payment" },
  { img: juiceBar, label: "Food & drinks", sw: "Vyakula", alt: "A juice bar owner checking her phone at her counter" },
  { img: fruitVendor, label: "Fresh produce", sw: "Matunda", alt: "A fruit seller giving a thumbs up at his stall" },
  { img: tailor, label: "Fashion & tailoring", sw: "Mitindo", alt: "A tailor smiling at his phone beside his sewing machine" },
  { img: carpenterWorkshop, label: "Crafts & furniture", sw: "Ufundi", alt: "A carpenter at work in his workshop" },
  { img: streetFood, label: "Street food", sw: "Chakula cha mtaani", alt: "A street food vendor smiling at his phone" },
];

const steps = [
  {
    icon: UserPlus,
    title: "Create your business account",
    body: "Sign up with your business name and a username. It's free, and every Nepo account is a business, brand or creator.",
  },
  {
    icon: BadgeCheck,
    title: "Set up your profile",
    body: "Add your photo, bio and category, plus your phone, WhatsApp, address and opening hours so customers can reach you.",
  },
  {
    icon: Camera,
    title: "Share what you sell",
    body: "Post photos and carousels, short reels and 24-hour stories. Add #hashtags and a location so the right people find you.",
  },
  {
    icon: MessageCircle,
    title: "Get discovered and chat",
    body: "Show up on Explore and Trending, gain followers, and answer customers directly in Messages.",
  },
];

const features = [
  { icon: Images, title: "Feed & posts", body: "Up to 10 photos or videos per post, with captions, hashtags and your location." },
  { icon: Clapperboard, title: "Reels", body: "Short vertical videos that show your products in action." },
  { icon: Sparkles, title: "Stories", body: "Daily updates, new stock and offers that disappear after 24 hours." },
  { icon: Compass, title: "Explore & Trending", body: "Get discovered by people who don't follow you yet, through Explore and trending hashtags." },
  { icon: Send, title: "Messages", body: "Talk to customers one-to-one: questions, orders and follow-ups in one inbox." },
  { icon: Store, title: "Business profile", body: "Your category, contact details, WhatsApp, address and opening hours in one place." },
];

function PrimaryCta({ children = "Create your free account" }: { children?: React.ReactNode }) {
  return (
    <Link
      href="/signup"
      className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-[15px] font-bold text-pill shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
    >
      {children}
      <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function WelcomePage() {
  return (
    <div className="flex-1 bg-background text-foreground">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5" aria-label="Main">
          <Link href="/" aria-label="Nepo home" className="text-foreground">
            <NepoWordmark height={30} />
          </Link>
          <div className="hidden items-center gap-8 text-sm font-semibold text-muted md:flex">
            <a href="#about" className="transition hover:text-foreground">About us</a>
            <a href="#how-it-works" className="transition hover:text-foreground">How it works</a>
            <a href="#features" className="transition hover:text-foreground">Features</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-full px-4 py-2 text-sm font-bold text-foreground transition hover:bg-surface">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-pill px-4 py-2 text-sm font-bold text-white transition hover:bg-black"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand/25 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 md:pt-16 lg:grid-cols-2 lg:gap-10 lg:pb-24">
            <div className="landing-rise">
             
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Where Tanzanian businesses{" "}
                <span className="relative whitespace-nowrap">
                  <span className="relative z-10">get seen.</span>
                  <span aria-hidden className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded-full bg-brand/60 sm:h-4" />
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                Nepo is the social platform for makers, traders and creators. Post your products, share reels and
                stories, chat with customers and grow a following — all from your phone.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PrimaryCta />
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-6 py-3.5 text-[15px] font-bold transition hover:border-foreground/30"
                >
                  I already have an account
                </Link>
              </div>
              
            </div>

            {/* Photo collage with floating app moments */}
            <div className="landing-rise relative mx-auto w-full max-w-md lg:max-w-none" style={{ animationDelay: "150ms" }}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl shadow-black/15 sm:aspect-[5/5]">
                <Image
                  src={heroFruitSeller}
                  alt="A fruit seller in Dar es Salaam smiling at her phone at her stall"
                  fill
                  sizes="(min-width: 1024px) 560px, (min-width: 640px) 448px, 100vw"
                  placeholder="blur"
                  loading="eager"
                  fetchPriority="high"
                  className="object-cover"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              </div>

              <div className="landing-float absolute -left-3 top-8 flex items-center gap-3 rounded-2xl border border-border bg-surface/95 p-3 pr-4 shadow-xl backdrop-blur sm:-left-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand">
                  <MessageCircle size={18} className="text-pill" />
                </span>
                <div className="leading-tight">
                  <p className="text-xs font-bold">New message</p>
                  <p className="text-xs text-muted">“Is this still available?”</p>
                </div>
              </div>

              <div className="landing-float-slow absolute -right-2 bottom-24 flex items-center gap-2.5 rounded-2xl bg-pill p-3 pr-4 text-white shadow-xl sm:-right-6">
                <Heart size={20} className="fill-red-500 text-red-500" />
                <div className="leading-tight">
                  <p className="text-sm font-extrabold">+128 likes</p>
                  <p className="text-[11px] text-white/60">on your new post</p>
                </div>
              </div>

              <div className="absolute -bottom-8 left-6 hidden w-44 overflow-hidden rounded-2xl border-4 border-background shadow-xl sm:block">
                <div className="relative aspect-[3/2]">
                  <Image
                    src={carpenterCelebrating}
                    alt="A carpenter celebrating as he reads his phone"
                    fill
                    sizes="176px"
                    placeholder="blur"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="landing-float absolute -bottom-5 right-8 flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-bold shadow-lg" style={{ animationDelay: "-3s" }}>
                <UserPlus size={15} className="text-brand-dark" /> +24 followers this week
              </div>
            </div>
          </div>
        </section>

        {/* ── Made for every kind of business ─────────────────────── */}
        <section aria-labelledby="kinds-heading" className="mx-auto max-w-6xl px-5 py-14">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-brand-dark">For every kind of business</p>
              <h2 id="kinds-heading" className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                From the duka to the workshop.
              </h2>
            </div>
            <p className="max-w-sm text-muted">Whatever you sell or make, Nepo gives your business a home online.</p>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {businessKinds.map((k) => (
              <li key={k.label} className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-border">
                <Image
                  src={k.img}
                  alt={k.alt}
                  fill
                  sizes="(min-width: 768px) 360px, 50vw"
                  placeholder="blur"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4">
                  <p className="text-sm font-extrabold text-white sm:text-base">{k.label}</p>
                  <p className="text-xs font-medium text-white/70">{k.sw}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── About us ───────────────────────────────────────────── */}
        <section id="about" aria-labelledby="about-heading" className="scroll-mt-20 bg-surface">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2">
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-[3/2] overflow-hidden rounded-[2rem] shadow-xl">
                <Image
                  src={teamLaptop}
                  alt="Three women planning together around a laptop"
                  fill
                  sizes="(min-width: 1024px) 560px, 100vw"
                  placeholder="blur"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-2 w-40 overflow-hidden rounded-2xl border-4 border-surface shadow-xl sm:-right-6 sm:w-52">
                <div className="relative aspect-[3/2]">
                  <Image src={tailor} alt="A tailor smiling at his phone" fill sizes="208px" placeholder="blur" className="object-cover" />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-sm font-bold uppercase tracking-wider text-brand-dark">About us</p>
              <h2 id="about-heading" className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Built for the businesses that keep Tanzania moving.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                The duka on the corner, the mama lishe, the fundi, the boutique, the farmer at the market — most of
                them sell through WhatsApp statuses and word of mouth. Nepo gives every one of them a proper home
                online.
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                On Nepo your business has a profile customers can trust, a feed that shows what you sell, and a direct
                line to the people who want to buy it. We built it in Tanzania, for Tanzanian businesses and the
                customers who love them.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Store, title: "Business-first", body: "Every account is a business, brand or creator." },
                  { icon: MapPin, title: "Local", body: "Made for Tanzanian sellers and buyers." },
                  { icon: Lock, title: "In your control", body: "Private accounts and follow requests when you want them." },
                  { icon: Heart, title: "Free to join", body: "Create an account and start posting today." },
                ].map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15">
                      <Icon size={19} className="text-brand-dark" />
                    </span>
                    <div>
                      <p className="font-bold">{title}</p>
                      <p className="text-sm text-muted">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────────── */}
        <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-20 mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-dark">How it works</p>
            <h2 id="how-heading" className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              From sign-up to your first customer, in four steps.
            </h2>
          </div>
          <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1fr_auto]">
            <ol className="grid gap-5 sm:grid-cols-2">
              {steps.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="relative rounded-3xl border border-border bg-surface p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pill text-brand">
                      <Icon size={20} />
                    </span>
                    <span className="text-sm font-extrabold text-muted">Step {i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                </li>
              ))}
            </ol>
            <PhoneMockup />
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────── */}
        <section id="features" aria-labelledby="features-heading" className="scroll-mt-20 bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-brand-dark">Features</p>
              <h2 id="features-heading" className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Everything your business needs to be seen.
              </h2>
            </div>
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, body }) => (
                <li key={title} className="rounded-3xl border border-border bg-background p-6 transition hover:-translate-y-1 hover:shadow-lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand">
                    <Icon size={20} className="text-pill" />
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Final call to action ───────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-pill px-6 py-14 text-center text-white sm:px-12">
            <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
            <div className="relative">
              <div className="mx-auto flex w-fit -space-x-3">
                {[shopOwner, tailor, juiceBar, fruitVendor, carpenterWorkshop].map((img, i) => (
                  <span key={i} className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-pill">
                    <Image src={img} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                ))}
              </div>
              <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                Your customers are already on their phones. Meet them on Nepo.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/70">
                Join the makers, traders and creators building around you. It takes a minute and it&apos;s free.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <PrimaryCta>Sign up — it&apos;s free</PrimaryCta>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-white/10"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <NepoWordmark height={28} />
            <p className="mt-3 text-sm text-muted">The social platform for Tanzanian businesses, makers and creators.</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm font-semibold text-muted">
            <a href="#about" className="hover:text-foreground">About us</a>
            <Link href="/login" className="hover:text-foreground">Log in</Link>
            <a href="#how-it-works" className="hover:text-foreground">How it works</a>
            <Link href="/signup" className="hover:text-foreground">Sign up</Link>
            <a href="#features" className="hover:text-foreground">Features</a>
            <Link href="/terms" className="hover:text-foreground">Terms &amp; Conditions</Link>
          </nav>
        </div>
        <div className="mx-auto flex max-w-6xl flex-col gap-1 border-t border-border px-5 py-5 text-xs text-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Nepo · Made in Tanzania</p>
          <p>Credits: JUSTAGUY</p>
        </div>
      </footer>
    </div>
  );
}

/** A phone showing the Nepo feed, so visitors see the app before signing up. */
function PhoneMockup() {
  const stories: { img: StaticImageData; name: string }[] = [
    { img: tailor, name: "Fundi" },
    { img: fruitVendor, name: "Matunda" },
    { img: carpenterWorkshop, name: "Seremala" },
    { img: streetFood, name: "Chips" },
  ];
  return (
    <div aria-hidden className="relative mx-auto w-[280px] shrink-0">
      <div className="absolute -inset-6 rounded-[3rem] bg-brand/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2.6rem] border-[10px] border-pill bg-background shadow-2xl">
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <NepoWordmark height={20} />
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface shadow-sm">
            <Bell size={13} />
          </span>
        </div>
        <div className="flex gap-2.5 px-4 pb-3">
          {stories.map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-1">
              <span className="rounded-full bg-brand p-[2px]">
                <span className="relative block h-11 w-11 overflow-hidden rounded-full border-2 border-background">
                  <Image src={s.img} alt="" fill sizes="44px" className="object-cover" />
                </span>
              </span>
              <span className="text-[9px] font-semibold">{s.name}</span>
            </div>
          ))}
        </div>
        <div className="mx-3 mb-4 overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-2 p-2.5">
            <span className="relative h-7 w-7 overflow-hidden rounded-full">
              <Image src={juiceBar} alt="" fill sizes="28px" className="object-cover" />
            </span>
            <div className="leading-none">
              <p className="flex items-center gap-1 text-[11px] font-bold">
                juice_corner <span className="rounded bg-brand px-1 py-px text-[7px] font-extrabold text-pill">BIZ</span>
              </p>
              <p className="mt-0.5 flex items-center gap-0.5 text-[9px] text-muted">
                <MapPin size={8} /> Kariakoo, Dar es Salaam
              </p>
            </div>
          </div>
          <div className="relative mx-2.5 aspect-[4/3.5] overflow-hidden rounded-xl">
            <Image src={juiceBar} alt="" fill sizes="240px" className="object-cover" />
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-[11px] font-bold">
            <span className="flex items-center gap-1"><Heart size={13} className="fill-red-500 text-red-500" /> 128</span>
            <span className="flex items-center gap-1"><MessageCircle size={13} /> 24</span>
            <Send size={12} />
          </div>
          <p className="px-3 pb-3 text-[10px] leading-snug">
            Fresh juice every morning 🍍 Pass by or order in Messages. <span className="font-bold text-brand-dark">#dsm #juice</span>
          </p>
        </div>
      </div>
    </div>
  );
}
