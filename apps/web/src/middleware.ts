import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/exam", "/admin", "/bookmarks", "/notes"];
const authPaths = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has("access_token");

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !hasToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuthPage && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (pathname.startsWith("/admin") && hasToken) {
    // Role check happens on API; middleware only checks token presence
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/exam/:path*", "/admin/:path*", "/login", "/signup", "/bookmarks/:path*"],
};
