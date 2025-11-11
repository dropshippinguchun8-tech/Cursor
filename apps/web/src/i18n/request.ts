import { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./locales";

export default createIntlMiddleware({
  locales,
  defaultLocale,
  localeDetection: true
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
