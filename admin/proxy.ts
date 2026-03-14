import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pagine pubbliche
  if (pathname.startsWith("/login")) return NextResponse.next();
  if (pathname.startsWith("/forgot-password")) return NextResponse.next();
  if (pathname.startsWith("/reset-password")) return NextResponse.next();

  // Tutte le altre route richiedono auth
  // Il token è in memoria — verifichiamo solo il cookie refresh_token come indicatore
  const hasRefreshCookie = request.cookies.has("refresh_token");

  if (!hasRefreshCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|forgot-password|reset-password).*)"],
};
