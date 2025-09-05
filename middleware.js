import { NextResponse } from "next/server";
// const jwt = require("jsonwebtoken");
import { verifyRedisToken } from "./services/auth/Auth.services";

// This function can be marked `async` if using `await` inside
export default async function middleware(request) {
  const token = request.cookies.get("token");
  const url = new URL(request.url);
  const pathname = url.pathname;
  const isValid = token ? await verifyRedisToken(token?.value) : null;

  if (pathname.startsWith("/redashChart/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/htmlReports/")) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (isValid) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      const response = NextResponse.next();
      response.cookies.delete("token");
      return response;
    }
  }

  if (
    pathname === "/LoginHelp" ||
    pathname === "/LoginReset" ||
    pathname === `/ForgotPassword` ||
    pathname === `/CreateDashboard`
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/active/")) {
    return NextResponse.next();
  }

  if (isValid) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/formControl/:path*",
    "/login/:path*",
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|/LoginHelp).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
