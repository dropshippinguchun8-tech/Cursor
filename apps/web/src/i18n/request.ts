import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { defaultLocale, locales, Locale } from "./locales";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localeDetection: true
});

function getLocaleFromPath(pathname: string): Locale | undefined {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (segment && locales.includes(segment as Locale)) {
    return segment as Locale;
  }
  return undefined;
}

export default function middleware(request: NextRequest) {
  const cookieLocale = request.cookies.get("lang")?.value as Locale | undefined;
  const pathnameLocale = getLocaleFromPath(request.nextUrl.pathname);

  if (!pathnameLocale && cookieLocale && locales.includes(cookieLocale)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${cookieLocale}${request.nextUrl.pathname}`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
