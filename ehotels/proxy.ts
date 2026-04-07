// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Change "export function middleware" to "export function proxy"
export function proxy(request: NextRequest) {
  const isAuthenticated = request.cookies.has("session");

  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Your existing logic...
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
