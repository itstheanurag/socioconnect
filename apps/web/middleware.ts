import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const userCookie = request.cookies.get("socioconnect_user")?.value;
  const tokenCookie = request.cookies.get("access_token")?.value;
  const isAuthenticated = Boolean(userCookie || tokenCookie);

  // Protected paths: /app and any subroutes
  const isProtectedPath = pathname.startsWith("/app");

  // 1. Unauthenticated user trying to access /app -> redirect to landing page with auth modal trigger
  if (isProtectedPath && !isAuthenticated) {
    const landingAuthUrl = new URL("/", request.url);
    landingAuthUrl.searchParams.set("auth", "login");
    landingAuthUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(landingAuthUrl);
  }

  // 2. Legacy /login route -> redirect to landing page
  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/app", request.url));
    }
    const landingUrl = new URL("/", request.url);
    landingUrl.searchParams.set("auth", "login");
    return NextResponse.redirect(landingUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login"],
};
