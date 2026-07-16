// middleware.js
import { NextResponse } from "next/server";
import { verifyRedisToken } from "./services/auth/Auth.services";

export default async function middleware(request) {
  const { pathname } = new URL(request.url);

  // 1) BYPASS THESE ROUTES COMPLETELY (no token checks)
  if (
    pathname.startsWith("/htmlReports/") || // <-- your DO route lives here
    pathname.startsWith("/redashChart/") ||
    pathname.startsWith("/active/") ||
    pathname === "/LoginHelp" ||
    pathname === "/LoginReset" ||
    pathname === "/ForgotPassword" ||
    pathname === "/CreateDashboard"
  ) {
    return NextResponse.next();
  }

  // 2) Only verify token for protected routes
  const token = request.cookies.get("token")?.value;
  let isValid = false;
  if (token) {
    try {
      isValid = await verifyRedisToken(token);
    } catch {
      isValid = false;
    }
  }

  // 3) Login route handling
  if (pathname === "/login") {
    if (isValid) return NextResponse.redirect(new URL("/dashboard", request.url));
    // return NextResponse.next();
    const res = NextResponse.next();
    res.cookies.delete("token");
    return res;
  }

  // 4) Gate everything else matched by the config
  if (isValid) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

// Make sure /htmlReports is EXCLUDED from the matcher
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/formControl/:path*",
    "/login/:path*",
    {
      // negative lookahead: do NOT match these public paths
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|LoginHelp|LoginReset|ForgotPassword|CreateDashboard|htmlReports|redashChart|active).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
