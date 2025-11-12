import { NextRequest, NextResponse } from "next/server";
import nextI18NextConfig from "./next-i18next.config.mjs";

const { locales, defaultLocale } = nextI18NextConfig.i18n;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (hasLocale || pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|assets|robots.txt).*)"]
};
