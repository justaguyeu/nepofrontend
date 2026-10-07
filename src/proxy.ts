import { NextRequest, NextResponse } from "next/server";

/** Only for signed-out visitors; signed-in people are sent to the feed. */
const AUTH_PATHS = ["/login", "/signup"];
/** Open to everyone, signed in or not (people must be able to read the Terms before signing up). */
const OPEN_PATHS = ["/terms"];
/** Set by src/lib/auth.ts (a marker, not a token). */
const SESSION_COOKIE = "nepo_session";

const matches = (pathname: string, paths: string[]) =>
  paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (matches(pathname, OPEN_PATHS)) return NextResponse.next();

  const signedIn = request.cookies.get(SESSION_COOKIE)?.value === "1";
  const isAuthPath = matches(pathname, AUTH_PATHS);

  if (!signedIn && !isAuthPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (signedIn && isAuthPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on everything except Next internals, static files, and the
     * favicon, so both "/" and every app route are protected.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
