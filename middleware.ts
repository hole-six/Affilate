import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/session";

export const config = {
  matcher: ["/admin/:path*", "/app/:path*", "/register", "/login", "/"],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  const { pathname, searchParams } = req.nextUrl;
  
  // 1. Check for referral code and prepare response
  let response = NextResponse.next();
  const refCode = searchParams.get("ref");
  
  // 2. Auth checks
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);

  if (pathname.startsWith("/admin") || pathname.startsWith("/app")) {
    if (!session) {
      response = NextResponse.redirect(loginUrl);
    } else if (pathname.startsWith("/admin") && session.role !== "admin") {
      response = NextResponse.redirect(new URL("/app", req.url));
    }
  }

  // 3. Set referral cookie if present on any route matched
  if (refCode) {
    response.cookies.set("ref_code", refCode, { maxAge: 60 * 60 * 24 * 30 }); // 30 days
  }

  return response;
}
